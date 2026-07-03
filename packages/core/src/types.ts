import { z } from "zod";

export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
export type Address = z.infer<typeof addressSchema>;

export const kycLevelSchema = z.enum([
  "NONE",
  "BASIC",
  "ADVANCED",
  "PREMIUM",
  "ULTIMATE"
]);
export type KycLevel = z.infer<typeof kycLevelSchema>;

export const kycStatusSchema = z.enum(["NONE", "APPROVED", "REVOKED"]);
export type KycStatus = z.infer<typeof kycStatusSchema>;

export const capabilitySchema = z.string().regex(/^[a-z][a-z0-9-]*:[a-z0-9:._-]+$/i);
export type Capability = z.infer<typeof capabilitySchema>;

export const paymentPolicySchema = z.object({
  id: z.string().min(1),
  chainId: z.number().int().positive(),
  recipient: addressSchema,
  token: addressSchema,
  amount: z.bigint().positive(),
  minKycLevel: kycLevelSchema.default("NONE"),
  requiredKycStatus: kycStatusSchema.default("NONE"),
  requiredCapabilities: z.array(capabilitySchema).default([]),
  deadline: z.date()
});
export type PaymentPolicy = z.infer<typeof paymentPolicySchema>;

export interface KycInfo {
  ensName: string;
  level: KycLevel;
  status: KycStatus;
  createdAt: Date | null;
  isHuman: boolean;
}

export interface KycProvider {
  getKycInfo(account: Address): Promise<KycInfo>;
}

export interface SettlementEvidence {
  payer: Address;
  recipient: Address;
  token: Address;
  amount: bigint;
  chainId: number;
  observedAt: Date;
  mandateHash?: `0x${string}`;
  receiptId?: string;
  satisfiedCapabilities: Capability[];
}

export interface VerificationDecision {
  ok: boolean;
  outcomeClass: "ACCEPT" | "REJECT";
  missingCapabilities: Capability[];
  reasons: string[];
}

