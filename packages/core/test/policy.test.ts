import { describe, expect, it } from "vitest";
import { StaticKycProvider, verifyPaymentPolicy } from "../src/index.js";
import type { KycInfo, PaymentPolicy, SettlementEvidence } from "../src/index.js";

const payer = "0x1111111111111111111111111111111111111111";
const recipient = "0x2222222222222222222222222222222222222222";
const token = "0x3333333333333333333333333333333333333333";

const approvedKyc: KycInfo = {
  ensName: "payer.eth",
  level: "ADVANCED",
  status: "APPROVED",
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  isHuman: true
};

const basePolicy: PaymentPolicy = {
  id: "paid-api-quote",
  chainId: 133,
  recipient,
  token,
  amount: 1_000_000n,
  minKycLevel: "ADVANCED",
  requiredKycStatus: "APPROVED",
  requiredCapabilities: ["attests:kyc:v1", "attests:sanctions:v1"],
  deadline: new Date("2026-07-14T23:59:59.000Z")
};

const baseEvidence: SettlementEvidence = {
  payer,
  recipient,
  token,
  chainId: 133,
  amount: 1_000_000n,
  observedAt: new Date("2026-07-03T00:00:00.000Z"),
  satisfiedCapabilities: ["attests:kyc:v1", "attests:sanctions:v1"]
};

describe("verifyPaymentPolicy", () => {
  it("accepts matching settlement with sufficient KYC and capabilities", async () => {
    const decision = await verifyPaymentPolicy({
      policy: basePolicy,
      evidence: baseEvidence,
      kycProvider: new StaticKycProvider(new Map([[payer.toLowerCase(), approvedKyc]]))
    });

    expect(decision).toMatchObject({
      ok: true,
      outcomeClass: "ACCEPT",
      reasons: []
    });
  });

  it("rejects missing compliance capabilities", async () => {
    const decision = await verifyPaymentPolicy({
      policy: basePolicy,
      evidence: {
        ...baseEvidence,
        satisfiedCapabilities: ["attests:kyc:v1"]
      },
      kycProvider: new StaticKycProvider(new Map([[payer.toLowerCase(), approvedKyc]]))
    });

    expect(decision.ok).toBe(false);
    expect(decision.missingCapabilities).toEqual(["attests:sanctions:v1"]);
  });
});

