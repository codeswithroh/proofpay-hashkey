#!/usr/bin/env node
import { StaticKycProvider, verifyPaymentPolicy } from "@proofpay/core";

const payer = "0x1111111111111111111111111111111111111111";
const recipient = "0x2222222222222222222222222222222222222222";
const token = "0x3333333333333333333333333333333333333333";

const decision = await verifyPaymentPolicy({
  policy: {
    id: "demo",
    chainId: 133,
    recipient,
    token,
    amount: 1_000_000n,
    minKycLevel: "ADVANCED",
    requiredKycStatus: "APPROVED",
    requiredCapabilities: ["attests:kyc:v1", "attests:sanctions:v1"],
    deadline: new Date("2026-07-14T23:59:59.000Z")
  },
  evidence: {
    payer,
    recipient,
    token,
    chainId: 133,
    amount: 1_000_000n,
    observedAt: new Date(),
    satisfiedCapabilities: ["attests:kyc:v1", "attests:sanctions:v1"]
  },
  kycProvider: new StaticKycProvider(
    new Map([
      [
        payer.toLowerCase(),
        {
          ensName: "demo.hashkey",
          level: "ADVANCED",
          status: "APPROVED",
          createdAt: new Date(),
          isHuman: true
        }
      ]
    ])
  )
});

console.log(JSON.stringify(decision, null, 2));

