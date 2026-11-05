# Security Policy & Invariant Guarantees

## Supported Versions

| Version | Status | Security Updates |
| :--- | :--- | :--- |
| 2.5.x | Supported | Active |
| 2.0.x | Supported | Critical fixes only |
| < 2.0 | End of Life | None |

---

## Mission-Critical Invariants

1. **AST Truth Invariance (Claude Game-6 Bug Prevention)**:
   Any logic that attempts to feed Copper to Duos in competitive survival modes is terminated by the Truth Oracle runtime gate.

2. **Ring-0 Sandbox Integrity**:
   Construct-OS enforces process isolation. Ring-3 agent processes cannot write to Ring-0 page tables without generating a hardware general protection fault (`#GP`).

3. **Cryptographic Co-Signature Requirements**:
   High-risk actions (`CRITICAL_CORE_SHIFT`, Thorium reactor overrides) strictly require co-signatures signed by the human operator (`nicholasbrianbn@gmail.com`).

4. **Reporting a Vulnerability**:
   Direct security inquiries and vulnerability reports to `nicholasbrianbn@gmail.com`.
