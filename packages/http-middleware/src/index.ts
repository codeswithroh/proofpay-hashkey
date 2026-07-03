import type {
  HspAttestationLike,
  HspReceiptLike,
  KycProvider,
  PaymentPolicy,
  SettlementEvidence,
  TrustPolicy,
  VerificationDecision
} from "@proofpay/core";
import { normalizeHspEvidence, verifyPaymentPolicy } from "@proofpay/core";

export interface PaidRequest {
  headers: Headers;
}

export interface PaymentEvidenceDecoder {
  decode(headers: Headers): Promise<SettlementEvidence | null>;
}

export interface PaymentRequirementResponse {
  status: 402;
  headers: Record<string, string>;
  body: {
    error: "payment_required";
    policy: Omit<PaymentPolicy, "amount" | "deadline"> & {
      amount: string;
      deadline: string;
    };
  };
}

export function buildPaymentRequired(policy: PaymentPolicy): PaymentRequirementResponse {
  return {
    status: 402,
    headers: {
      "content-type": "application/json",
      "proofpay-policy-id": policy.id
    },
    body: {
      error: "payment_required",
      policy: {
        ...policy,
        amount: policy.amount.toString(),
        deadline: policy.deadline.toISOString()
      }
    }
  };
}

function decodeBase64UrlJson<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

export class HspHeaderEvidenceDecoder implements PaymentEvidenceDecoder {
  constructor(private readonly trustPolicy: TrustPolicy) {}

  async decode(headers: Headers): Promise<SettlementEvidence | null> {
    const receiptHeader = headers.get("proofpay-receipt");
    if (!receiptHeader) {
      return null;
    }

    const attestationsHeader = headers.get("proofpay-attestations");
    return normalizeHspEvidence({
      receipt: decodeBase64UrlJson<HspReceiptLike>(receiptHeader),
      attestations: attestationsHeader
        ? decodeBase64UrlJson<HspAttestationLike[]>(attestationsHeader)
        : [],
      trustPolicy: this.trustPolicy
    });
  }
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
