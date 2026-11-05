#!/usr/bin/env bash
# ==============================================================================
# Sovereign Zenith - System Environment Bootstrapper
# ==============================================================================

set -euo pipefail

echo "==> Sovereign Zenith: Verifying Toolchain Invariants..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node -v)
  echo "[✓] Node.js installed: $NODE_VER"
else
  echo "[!] Node.js missing. Please install Node 22+."
fi

# Check Java
if command -v java >/dev/null 2>&1; then
  JAVA_VER=$(java -version 2>&1 | head -n 1)
  echo "[✓] Java installed: $JAVA_VER"
  if echo "$JAVA_VER" | grep -q "17."; then
    echo "[✓] Java 17 detected (Mindustry Arc annotation safe)."
  else
    echo "[!] Warning: Mindustry source compilation requires Java 17. JDK 21+ may fail Arc annotation processors."
  fi
else
  echo "[i] Java not detected in path. Needed for headless Mindustry server."
fi

# Check /dev/shm
if [ -d "/dev/shm" ]; then
  echo "[✓] POSIX /dev/shm detected."
else
  echo "[i] /dev/shm not mounted directly; will fall back to virtual IPC memory."
fi

echo "==> Bootstrapping completed successfully."
