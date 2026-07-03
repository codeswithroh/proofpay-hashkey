import {
  type Capability,
  type KycProvider,
  type PaymentPolicy,
  paymentPolicySchema,
  type SettlementEvidence,
  type VerificationDecision
} from "./types.js";
import { satisfiesKycLevel, satisfiesKycStatus } from "./kyc.js";

function diffCapabilities(required: Capability[], satisfied: Capability[]): Capability[] {
  const satisfiedSet = new Set(satisfied);
  return required.filter((capability) => !satisfiedSet.has(capability));
}

export async function verifyPaymentPolicy(args: {
  policy: PaymentPolicy;
  evidence: SettlementEvidence;
  kycProvider: KycProvider;
}): Promise<VerificationDecision> {
  const policy = paymentPolicySchema.parse(args.policy);
  const reasons: string[] = [];

  if (args.evidence.chainId !== policy.chainId) {
    reasons.push(`Expected chain ${policy.chainId}, got ${args.evidence.chainId}.`);
  }

  if (args.evidence.recipient.toLowerCase() !== policy.recipient.toLowerCase()) {
    reasons.push("Settlement recipient does not match policy recipient.");
  }

  if (args.evidence.token.toLowerCase() !== policy.token.toLowerCase()) {
    reasons.push("Settlement token does not match policy token.");
  }

  if (args.evidence.amount < policy.amount) {
    reasons.push("Settlement amount is below policy amount.");
  }

  if (args.evidence.observedAt > policy.deadline) {
    reasons.push("Settlement was observed after the policy deadline.");
  }

  const kyc = await args.kycProvider.getKycInfo(args.evidence.payer);
  if (!satisfiesKycStatus(kyc.status, policy.requiredKycStatus)) {
    reasons.push(`KYC status ${kyc.status} does not satisfy ${policy.requiredKycStatus}.`);
  }

  if (!satisfiesKycLevel(kyc.level, policy.minKycLevel)) {
    reasons.push(`KYC level ${kyc.level} does not satisfy ${policy.minKycLevel}.`);
  }

  const missingCapabilities = diffCapabilities(
    policy.requiredCapabilities,
    args.evidence.satisfiedCapabilities
  );

  if (missingCapabilities.length > 0) {
    reasons.push(`Missing capabilities: ${missingCapabilities.join(", ")}.`);
  }

  return {
    ok: reasons.length === 0,
    outcomeClass: reasons.length === 0 ? "ACCEPT" : "REJECT",
    missingCapabilities,
    reasons
  };
}

