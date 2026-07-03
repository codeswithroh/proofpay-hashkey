import { describe, expect, it } from "vitest";
import { buildPaymentRequired, HspHeaderEvidenceDecoder } from "../src/index.js";
import type { PaymentPolicy } from "@proofpay/core";

const payer = "0x1111111111111111111111111111111111111111";
const recipient = "0x2222222222222222222222222222222222222222";
const token = "0x3333333333333333333333333333333333333333";
const adapter = "0x4444444444444444444444444444444444444444";
const issuer = "0x5555555555555555555555555555555555555555";

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

describe("buildPaymentRequired", () => {
  it("serializes bigint and dates for HTTP 402 responses", () => {
    const policy: PaymentPolicy = {
      id: "test",
      chainId: 133,
      recipient,
      token,
      amount: 1_000_000n,
      minKycLevel: "ADVANCED",
      requiredKycStatus: "APPROVED",
      requiredCapabilities: ["attests:kyc:v1"],
      deadline: new Date("2026-07-14T23:59:59.000Z")
    };

    expect(buildPaymentRequired(policy).body.policy).toMatchObject({
      amount: "1000000",
      deadline: "2026-07-14T23:59:59.000Z"
    });
  });
});

describe("HspHeaderEvidenceDecoder", () => {
  it("decodes base64url receipt and attestation headers", async () => {
    const decoder = new HspHeaderEvidenceDecoder({
      pinnedAdapterOperators: [adapter],
      trustedIssuers: [issuer]
    });

    const headers = new Headers({
      "proofpay-receipt": encode({
        mandateHash: "0xabc",
        adapterAddress: adapter,
        outcome: "SETTLED",
        settledAt: "2026-07-03T00:00:00.000Z",
        settlement: {
          payer,
          recipient,
          token,
          amount: "1000000",
          chainId: 133
        },
        satisfiedCapabilities: ["proves:hashkey-settlement:v1"]
      }),
      "proofpay-attestations": encode([
        {
          issuer,
          subject: payer,
          capability: "attests:kyc:v1",
          issuedAt: "2026-07-01T00:00:00.000Z",
          expiresAt: "2026-07-14T23:59:59.000Z"
        }
      ])
    });

    await expect(decoder.decode(headers)).resolves.toMatchObject({
      payer,
      satisfiedCapabilities: ["proves:hashkey-settlement:v1", "attests:kyc:v1"]
    });
  });
});

