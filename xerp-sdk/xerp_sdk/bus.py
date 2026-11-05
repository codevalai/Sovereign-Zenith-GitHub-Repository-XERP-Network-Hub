# xerp_sdk/bus.py
# Zero-Copy POSIX /dev/shm Ring Buffer Driver with SeqLock Synchronization

import mmap
import os
import struct
import time
from typing import Optional

SHM_DEFAULT_PATH = "/dev/shm/xerp_agent_bus.v1"
RING_BUFFER_CAPACITY = 65536  # 64KB shared bus ring
MAGIC_HEADER_SIZE = 8         # 8 bytes for 64-bit atomic sequence lock


class XerpShmBus:
    """
    Python interface for XERP zero-copy POSIX shared memory ring bus.
    Enables lock-free multi-process agent communication via /dev/shm.
    """

    def __init__(self, path: str = SHM_DEFAULT_PATH, create: bool = False):
        self.path = path
        self.total_size = MAGIC_HEADER_SIZE + RING_BUFFER_CAPACITY
        self._fd: Optional[int] = None
        self._mmap: Optional[mmap.mmap] = None
        self._init_mmap(create)

    def _init_mmap(self, create: bool) -> None:
        mode = os.O_RDWR | os.O_CREAT if create else os.O_RDWR
        
        if create and not os.path.exists(self.path):
            with open(self.path, "wb") as f:
                f.write(b"\x00" * self.total_size)

        self._fd = os.open(self.path, mode)
        
        # Ensure file sizing matches ring capacity
        if os.path.getsize(self.path) < self.total_size:
            os.ftruncate(self._fd, self.total_size)

        self._mmap = mmap.mmap(
            self._fd,
            self.total_size,
            mmap.MAP_SHARED,
            mmap.PROT_READ | mmap.PROT_WRITE
        )

    def publish(self, payload: bytes) -> None:
        """
        Publishes agent telemetry deltas with SeqLock write-barrier protection.
        """
        if len(payload) > RING_BUFFER_CAPACITY - 4:
            raise ValueError("Payload exceeds ring buffer capacity limit")

        # 1. Read current sequence
        self._mmap.seek(0)
        current_seq = struct.unpack("<Q", self._mmap.read(8))[0]

        # 2. Begin write: transition sequence to odd number (writer lock acquired)
        new_seq = current_seq + 1
        self._mmap.seek(0)
        self._mmap.write(struct.pack("<Q", new_seq))

        # 3. Write payload length prefix + raw byte payload
        self._mmap.seek(8)
        self._mmap.write(struct.pack("<I", len(payload)))
        self._mmap.write(payload)

        # 4. End write: transition sequence to even number (release lock)
        final_seq = new_seq + 1
        self._mmap.seek(0)
        self._mmap.write(struct.pack("<Q", final_seq))

    def read(self, max_retries: int = 10) -> Optional[bytes]:
        """
        Reads agent delta packets using SeqLock reader validation for lock-free consistency.
        """
        for _ in range(max_retries):
            # Read sequence before reading data
            self._mmap.seek(0)
            seq1_bytes = self._mmap.read(8)
            if len(seq1_bytes) < 8:
                return None
            seq1 = struct.unpack("<Q", seq1_bytes)[0]

            # If sequence is odd, a writer is active; retry
            if seq1 % 2 != 0:
                time.sleep(0.00001)
                continue

            # Read payload length
            self._mmap.seek(8)
            length_bytes = self._mmap.read(4)
            if len(length_bytes) < 4:
                return None
            length = struct.unpack("<I", length_bytes)[0]

            if length > RING_BUFFER_CAPACITY:
                return None

            payload = self._mmap.read(length)

            # Read sequence after reading data
            self._mmap.seek(0)
            seq2 = struct.unpack("<Q", self._mmap.read(8))[0]

            # If sequence didn't change, read is clean and valid
            if seq1 == seq2:
                return payload

            # Concurrent write occurred during read; retry

        return None

    def close(self) -> None:
        if self._mmap:
            self._mmap.close()
        if self._fd is not None:
            os.close(self._fd)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
