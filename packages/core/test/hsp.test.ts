import { describe, expect, it } from "vitest";
import { normalizeHspEvidence } from "../src/index.js";

const payer = "0x1111111111111111111111111111111111111111";
const recipient = "0x2222222222222222222222222222222222222222";
const token = "0x3333333333333333333333333333333333333333";
const adapter = "0x4444444444444444444444444444444444444444";
const issuer = "0x5555555555555555555555555555555555555555";

describe("normalizeHspEvidence", () => {
  it("admits pinned adapter receipts and trusted attestations", () => {
    const evidence = normalizeHspEvidence({
      receipt: {
        mandateHash: "0xabc",
        adapterAddress: adapter,
        outcome: "SETTLED",
        settledAt: 1_783_000_000,
        settlement: {
          payer,
          recipient,
          token,
          amount: "1000000",
          chainId: 133,
          txHash: "0xdef"
        },
        satisfiedCapabilities: ["proves:hashkey-settlement:v1"]
      },
      attestations: [
        {
          issuer,
          subject: payer,
          capability: "attests:kyc:v1",
          issuedAt: 1_782_000_000,
          expiresAt: 1_784_000_000
        }
      ],
      trustPolicy: {
        pinnedAdapterOperators: [adapter],
        trustedIssuers: [issuer]
      },
      now: new Date(1_783_100_000_000)
    });

    expect(evidence.satisfiedCapabilities).toEqual([
      "proves:hashkey-settlement:v1",
      "attests:kyc:v1"
    ]);
  });

  it("rejects unpinned adapter operators", () => {
    expect(() =>
      normalizeHspEvidence({
        receipt: {
          mandateHash: "0xabc",
          adapterAddress: adapter,
          outcome: "SETTLED",
          settledAt: 1_783_000_000,
          settlement: { payer, recipient, token, amount: 1n, chainId: 133 }
        },
        trustPolicy: {
          pinnedAdapterOperators: [],
          trustedIssuers: []
        }
      })
    ).toThrow("not pinned");
  });
});

