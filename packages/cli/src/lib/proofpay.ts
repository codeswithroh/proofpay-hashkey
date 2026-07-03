import {
  normalizeHspEvidence,
  StaticKycProvider,
  type Address,
  type KycInfo,
  type PaymentPolicy,
  type SettlementEvidence
} from "@proofpay/core";

export function parsePolicy(
  input: Omit<PaymentPolicy, "amount" | "deadline"> & {
    amount: string | number | bigint;
    deadline: string | Date;
  }
): PaymentPolicy {
  return {
    ...input,
    amount: BigInt(input.amount),
    deadline: new Date(input.deadline)
  };
}

export function parseEvidence(
  input: Omit<SettlementEvidence, "amount" | "observedAt"> & {
    amount: string | number | bigint;
    observedAt: string | Date;
  }
): SettlementEvidence {
  return {
    ...input,
    amount: BigInt(input.amount),
    observedAt: new Date(input.observedAt)
  };
}

export function demoAddresses(): { payer: Address; recipient: Address; token: Address } {
  return {
    payer: "0x1111111111111111111111111111111111111111",
    recipient: "0x2222222222222222222222222222222222222222",
    token: "0x3333333333333333333333333333333333333333"
  };
}

export function demoPolicy(): PaymentPolicy {
  const { recipient, token } = demoAddresses();
  return {
    id: "paid-alpha-demo",
    chainId: 133,
    recipient,
    token,
    amount: 1_000_000n,
    minKycLevel: "ADVANCED",
    requiredKycStatus: "APPROVED",
    requiredCapabilities: [
      "proves:hashkey-settlement:v1",
      "attests:kyc:v1",
      "attests:sanctions:v1"
    ],
    deadline: new Date("2026-07-14T23:59:59.000Z")
  };
}

export function demoKycProvider(payer: Address): StaticKycProvider {
  const approvedKyc: KycInfo = {
    ensName: "demo.hashkey",
    level: "ADVANCED",
    status: "APPROVED",
    createdAt: new Date(),
    isHuman: true
  };

  return new StaticKycProvider(new Map([[payer.toLowerCase(), approvedKyc]]));
}

export function normalizeHspFile(input: Parameters<typeof normalizeHspEvidence>[0]): SettlementEvidence {
  return normalizeHspEvidence(input);
}

