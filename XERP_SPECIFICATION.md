# XERP/1.0-ED25519-AST Protocol Specification

## RFC-Style Technical Specification for the eXtensible Entity Reference Protocol

### Status of This Memo
This document specifies the standard protocol for zero-overhead AST code reference exchange, shared-memory inter-agent communication, and decentralized knowledge federation.

---

## 1. Protocol Overview

* **Protocol Identifier**: `XERP/1.0-ED25519-AST`
* **Default Port**: `9200` (MCP / AST provider daemon), `4001` (Libp2p swarm)
* **Transport Bindings**:
  1. `posix-shm`: `/dev/shm/mindustry_cmd.shm` (Zero-copy local IPC, <0.05ms)
  2. `json-rpc-ws`: `ws://localhost:9200/rpc` (Bidirectional event stream)
  3. `libp2p-gossip`: `/xerp/corpus/v1/mindustry-sovereign` (Global WAN federation)

---

## 2. Packet Schemas & Wire Format

### 2.1 Handshake Challenge Packet (`XerpChallenge`)
```typescript
interface XerpChallenge {
  protocol: "XERP/1.0-ED25519-AST";
  nonce: string; // "nonce_<timestamp>_<hex8>"
  hubEndpoint: string;
  issuedAt: number;
}
```

### 2.2 Handshake Response Packet (`XerpAttestation`)
```typescript
interface XerpAttestation {
  protocol: "XERP/1.0-ED25519-AST";
  nodeDid: string; // "did:xerp:sovereign-zenith-node-<id>"
  operator: string; // Operator email (e.g. nicholasbrianbn@gmail.com)
  publicKey: string; // Hex Ed25519 public key
  consensusRoot: string; // 32-byte Merkle root
  capabilities: {
    treeSitterGrammars: string[];
    referenceCodingCompressionRatio: string;
    sharedMemoryIPC: boolean;
    maxTps: number;
  };
  signature: string; // Ed25519 signature of nonce:nodeDid:operator
}
```

### 2.3 AST Query Request (`XerpAstQuery`)
```typescript
interface XerpAstQuery {
  jsonrpc: "2.0";
  id: string | number;
  method: "xerp.querySymbol";
  params: {
    symbol: string;
    languages?: string[];
    maxDepth?: number;
    includeCallGraph?: boolean;
  };
}
```

### 2.4 AST Query Response (`XerpAstResponse`)
```typescript
interface XerpAstResponse {
  jsonrpc: "2.0";
  id: string | number;
  result: {
    symbol: string;
    matches: Array<{
      file: string;
      line: number;
      kind: "function" | "class" | "interface" | "struct" | "const";
      signature: string;
      docstring?: string;
    }>;
    compressionStats: {
      rawContextTokens: number;
      astReferenceTokens: number;
      compressionRatio: string; // e.g. "26.2x"
    };
  };
}
```

---

## 3. Security Considerations & Threat Model
1. **Rogue Mutation Evasion**: Spatial AABB leases guarantee that no two autonomous agents mutate overlapping tiles.
2. **Replay Protection**: Challenge nonces are single-use with a 30-second TTL.
3. **Sybil Resistance**: Nodes must provide valid Ed25519 signatures verifiable against the federation root.
