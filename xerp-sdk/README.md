# xerp-sdk (Python)

High-speed zero-copy POSIX shared memory (`/dev/shm`) ring buffer driver with atomic SeqLock synchronization for XERP autonomous agent swarms.

## Installation
```bash
pip install -e ./xerp-sdk
```

## Quickstart
```python
from xerp_sdk import XerpShmBus

# Initialize shared memory publisher/subscriber
bus = XerpShmBus(create=True)

# Publish agent telemetry packet (<0.04ms)
bus.publish(b'{"entity_id": "0x58455250", "tick": 89042, "status": "ACTIVE"}')

# Read packet with SeqLock lock-free verification
data = bus.read()
print("Received:", data.decode('utf-8'))

bus.close()
```
