import type {
  KycProvider,
  PaymentPolicy,
  SettlementEvidence,
  VerificationDecision
} from "@proofpay/core";
import { verifyPaymentPolicy } from "@proofpay/core";

export interface PaidRequest {
  headers: Headers;
}

export interface PaymentEvidenceDecoder {
  decode(headers: Headers): Promise<SettlementEvidence | null>;
}

export async function verifyPaidRequest(args: {
  request: PaidRequest;
  policy: PaymentPolicy;
  decoder: PaymentEvidenceDecoder;
  kycProvider: KycProvider;
}): Promise<VerificationDecision> {
  const evidence = await args.decoder.decode(args.request.headers);
  if (!evidence) {
    return {
      ok: false,
      outcomeClass: "REJECT",
      missingCapabilities: args.policy.requiredCapabilities,
      reasons: ["Missing ProofPay settlement evidence."]
    };
  }

  return verifyPaymentPolicy({
    policy: args.policy,
    evidence,
    kycProvider: args.kycProvider
  });
}

