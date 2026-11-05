import { z } from "zod";

export const MerkleDeltaSchema = z.object({
  entityId: z.string().min(1),
  tick: z.number().int().nonnegative(),
  stateHash: z.string().regex(/^[a-f0-9]{64}$/, "Must be a 32-byte hex-encoded Blake3 hash"),
  timestampMs: z.number().int().positive(),
});

export const MerkleSyncPayloadSchema = z.object({
  nodeDid: z.string().regex(/^did:xerp:sovereign-[a-z0-9-]+$/, "Invalid DID format"),
  corpusId: z.string().min(1),
  simulationEpoch: z.number().int().positive(),
  tpsTarget: z.literal(480),
  blake3MerkleRoot: z.string().regex(/^[a-f0-9]{64}$/, "Root must be a 64-character hex Blake3 digest"),
  leafCount: z.number().int().positive(),
  deltas: z.array(MerkleDeltaSchema).max(1024),
  zkProof: z.string().startsWith("0xzk_").optional(),
  ed25519Signature: z.string().regex(/^[a-f0-9]{128}$/, "Must be a 64-byte hex Ed25519 signature"),
  publicKeyHex: z.string().regex(/^[a-f0-9]{64}$/, "Must be a 32-byte hex Ed25519 public key"),
});

export type MerkleDelta = z.infer<typeof MerkleDeltaSchema>;
export type MerkleSyncPayload = z.infer<typeof MerkleSyncPayloadSchema>;

export const MerkleSyncResponseSchema = z.object({
  status: z.enum(["ACCEPTED", "QUARANTINED", "REJECTED"]),
  corpusId: z.string(),
  receivedRoot: z.string(),
  canonicalRoot: z.string().optional(),
  bftConsensusRatio: z.number(),
  attestationId: z.string(),
  latencyMs: z.number(),
});

export type MerkleSyncResponse = z.infer<typeof MerkleSyncResponseSchema>;
