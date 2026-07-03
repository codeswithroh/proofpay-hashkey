#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { createHashKeyKycProviderFromEnv } from "@proofpay/hashkey";
import {
  normalizeHspEvidence,
  StaticKycProvider,
  verifyPaymentPolicy,
  type Address,
  type KycInfo,
  type PaymentPolicy,
  type SettlementEvidence
} from "@proofpay/core";

function print(value: unknown): void {
  console.log(
    JSON.stringify(
      value,
      (_key, item) => (typeof item === "bigint" ? item.toString() : item),
      2
    )
  );
}

function usage(): never {
  console.error(`Usage:
  proofpay demo
  proofpay verify <policy.json> <evidence.json>
  proofpay verify-hsp <policy.json> <hsp-evidence.json>
  proofpay kyc <0xAddress>
`);
  process.exit(1);
}

async function readJsonFile<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

function parsePolicy(input: PaymentPolicy & { amount: string | number | bigint; deadline: string | Date }): PaymentPolicy {
  return {
    ...input,
    amount: BigInt(input.amount),
    deadline: new Date(input.deadline)
  };
}

function parseEvidence(input: SettlementEvidence & { amount: string | number | bigint; observedAt: string | Date }): SettlementEvidence {
  return {
    ...input,
    amount: BigInt(input.amount),
    observedAt: new Date(input.observedAt)
  };
}

function demoKycProvider(payer: Address): StaticKycProvider {
  const approvedKyc: KycInfo = {
    ensName: "demo.hashkey",
    level: "ADVANCED",
    status: "APPROVED",
    createdAt: new Date(),
    isHuman: true
  };

  return new StaticKycProvider(new Map([[payer.toLowerCase(), approvedKyc]]));
}

async function runDemo(): Promise<void> {
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
    kycProvider: demoKycProvider(payer)
  });

  print(decision);
}

async function runVerify(policyPath: string, evidencePath: string): Promise<void> {
  const policy = parsePolicy(await readJsonFile(policyPath));
  const evidence = parseEvidence(await readJsonFile(evidencePath));
  const decision = await verifyPaymentPolicy({
    policy,
    evidence,
    kycProvider: demoKycProvider(evidence.payer)
  });
  print(decision);
}

async function runVerifyHsp(policyPath: string, evidencePath: string): Promise<void> {
  const policy = parsePolicy(await readJsonFile(policyPath));
  const hsp = await readJsonFile<Parameters<typeof normalizeHspEvidence>[0]>(evidencePath);
  const evidence = normalizeHspEvidence(hsp);
  const decision = await verifyPaymentPolicy({
    policy,
    evidence,
    kycProvider: demoKycProvider(evidence.payer)
  });
  print(decision);
}

async function runKyc(address: Address): Promise<void> {
  const provider = createHashKeyKycProviderFromEnv();
  print(await provider.getKycInfo(address));
}

const [command, ...args] = process.argv.slice(2);

try {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
  }

  if (command === "demo") {
    await runDemo();
  } else if (command === "verify" && args.length === 2) {
    await runVerify(args[0], args[1]);
  } else if (command === "verify-hsp" && args.length === 2) {
    await runVerifyHsp(args[0], args[1]);
  } else if (command === "kyc" && args.length === 1) {
    await runKyc(args[0] as Address);
  } else {
    usage();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

