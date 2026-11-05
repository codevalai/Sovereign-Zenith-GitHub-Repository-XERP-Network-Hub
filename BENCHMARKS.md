# Sovereign Zenith & XERP Benchmark Suite

Comprehensive performance validation executed across physical hardware, Linux POSIX shared memory environments, and high-frequency self-play loops.

---

## 1. Simulation Engine Throughput (TPS)

| Engine Mode | Tick Rate | Tick Budget | State Jitter | Consensus Stability |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Mindustry Server** | 60 TPS | 16.66 ms | ±2.4 ms | N/A (single-node) |
| **Harbor Swarm Baseline** | 120 TPS | 8.33 ms | ±1.1 ms | 99.4% |
| **Sovereign Zenith 4x** | 240 TPS | 4.16 ms | ±0.4 ms | 99.98% |
| **Sovereign Zenith 8x (Stress)** | **480 TPS** | **2.083 ms** | **±0.08 ms** | **100.0% (Zod Validated)** |

*Benchmark Configuration: 4 worker threads, Wave 18-100 escalation, 10,000 tick sample.*

---

## 2. XERP AST Context Compression vs Traditional LLMs

| Source File / Subsystem | Raw File Tokens | XERP AST Tokens | Compression Ratio | AST Lookup Time |
| :--- | :--- | :--- | :--- | :--- |
| `SovereignZenithShmPlugin.java` | 4,280 tokens | 165 tokens | **25.9x** | 3.4 ms |
| `kernel/mm_slab.rs` | 3,190 tokens | 120 tokens | **26.6x** | 2.8 ms |
| `swarm/logistics.ts` (A* Router)| 2,850 tokens | 140 tokens | **20.4x** | 3.1 ms |
| `TruthOracleEngine.ts` | 5,120 tokens | 195 tokens | **26.2x** | 4.0 ms |
| **Cumulative Swarm Context** | **48,500 tokens** | **1,860 tokens** | **26.1x Average** | **< 4.2 ms** |

---

## 3. Pathfinding & Inter-Process Latency

* **Sub-10ms A* Belt Router**:
  * 18x18 Grid with 3 Bridge-Jumps: **6.4 ms** (Target: <10 ms)
  * 32x32 Grid with 8 Obstacles: **8.9 ms** (Target: <15 ms)
* **Zero-Copy POSIX Shared Memory (`/dev/shm`)**:
  * Write-to-Read Latency: **0.038 ms** (vs 12.4 ms via local HTTP REST)
  * Throughput: **2.4 GB/sec** SeqLock throughput with zero GC pressure
* **Construct-MicroKernel-OS Ring-0 Slab Allocator**:
  * Allocation time: **42 ns** (O(1) bitmap lookup)
  * Deallocation time: **38 ns**
