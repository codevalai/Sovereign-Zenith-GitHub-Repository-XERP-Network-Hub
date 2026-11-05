# Contributing to Sovereign Zenith Swarm

Thank you for contributing to the Sovereign Zenith Swarm & Construct OS Workstation. We maintain mission-critical performance standards across real-time multi-agent execution, `#![no_std]` microkernel programming, and XERP knowledge federation.

## Invariant Guidelines

1. **AST Truth Invariance**:
   All turret specifications, ammo types, and crafting ratios MUST match Mindustry v146 byte-exact schemas. Any change that allows Copper to feed Duos in tournament scenarios will be rejected by the CI Oracle Gate.

2. **Zero-GC Telemetry Contracts**:
   The shared memory bridge (`/dev/shm/mindustry_cmd.shm`) strictly forbids dynamic allocations in the game tick path. All structures must use fixed-size memory layouts and SeqLock sequence validation.

3. **Sub-10ms Pathfinding Budget**:
   Logistics agents must verify that A* routing across 18x18 to 64x64 grids completes in under 10ms, including multi-tile bridge spans.

4. **mLog Firmware 1000-Instruction Limit**:
   All synthesized logic processor hotpatches must strictly compile to fewer than 1,000 instructions to guarantee runtime execution on Mindustry Microprocessors.

5. **XERP Federation Attestation**:
   Nodes joining the XERP network must provide valid Ed25519 signatures, announce supported Tree-Sitter grammars, and respect Gossipsub topic backpressure.

## Pull Request Lifecycle

1. Fork and create a topic branch: `git checkout -b feat/quantum-flank-heuristic`.
2. Ensure code compiles cleanly:
   ```bash
   npm run lint
   cargo check --manifest-path kernel/Cargo.toml
   ./gradlew test
   ```
3. Run the 480 TPS benchmark suite:
   ```bash
   ./scripts/run-480tps-benchmark.sh
   ```
4. Sign commits using GPG or Ed25519.
5. Submit PR with telemetry benchmark diffs attached.
