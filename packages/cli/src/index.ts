#!/usr/bin/env node
import http from "node:http";
import { Command, Option } from "commander";
import kleur from "kleur";
import { createHashKeyKycProviderFromEnv } from "@proofpay/hashkey";
import { buildPaymentRequired } from "@proofpay/http-middleware";
import {
  normalizeHspEvidence,
  verifyPaymentPolicy,
  type Address,
  type PaymentPolicy
} from "@proofpay/core";
import {
  configureColor,
  encodeBase64UrlJson,
  printDecision,
  printJson,
  printKV,
  readJsonFile,
  symbol,
  writeJsonFile
} from "./lib/io.js";
import {
  demoAddresses,
  demoKycProvider,
  demoPolicy,
  parseEvidence,
  parsePolicy
} from "./lib/proofpay.js";

interface RootOptions {
  json?: boolean;
  color?: boolean;
}

function rootOptions(command: Command): RootOptions {
  const opts = command.optsWithGlobals<RootOptions>();
  configureColor(opts);
  return opts;
}

function showOrJson(command: Command, value: unknown, pretty: () => void): void {
  if (rootOptions(command).json) {
    printJson(value);
    return;
  }
  pretty();
}

async function verifyWithPolicy(args: {
  policy: PaymentPolicy;
  evidence: ReturnType<typeof parseEvidence>;
}): Promise<Awaited<ReturnType<typeof verifyPaymentPolicy>>> {
  return verifyPaymentPolicy({
    policy: args.policy,
    evidence: args.evidence,
    kycProvider: demoKycProvider(args.evidence.payer)
  });
}

async function runVerification(args: {
  policyPath: string;
  evidencePath: string;
  hsp?: boolean;
}): Promise<{
  policy: PaymentPolicy;
  evidence: ReturnType<typeof parseEvidence>;
  decision: Awaited<ReturnType<typeof verifyPaymentPolicy>>;
}> {
  const policy = parsePolicy(await readJsonFile(args.policyPath));
  const rawEvidence = await readJsonFile(args.evidencePath);
  const evidence = args.hsp
    ? normalizeHspEvidence(rawEvidence as Parameters<typeof normalizeHspEvidence>[0])
    : parseEvidence(rawEvidence as Parameters<typeof parseEvidence>[0]);
  const decision = await verifyWithPolicy({ policy, evidence });
  return { policy, evidence, decision };
}

function setDecisionExitCode(ok: boolean): void {
  if (!ok) {
    process.exitCode = 2;
  }
}

const program = new Command()
  .name("proofpay")
  .description("HashKey-native compliant settlement verification toolkit")
  .version("0.1.0")
  .addOption(new Option("--json", "print machine-readable JSON"))
  .addOption(new Option("--no-color", "disable color output"))
  .showHelpAfterError()
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true
  });

program
  .command("doctor")
  .description("check local ProofPay setup")
  .option("--strict", "exit non-zero for warnings")
  .action((options: { strict?: boolean }, command: Command) => {
    const checks = [
      {
        name: "node",
        ok: Number(process.versions.node.split(".")[0]) >= 20,
        detail: `v${process.versions.node}`
      },
      {
        name: "HASHKEY_KYC_SBT_ADDRESS",
        ok:
          !!process.env.HASHKEY_KYC_SBT_ADDRESS &&
          process.env.HASHKEY_KYC_SBT_ADDRESS !== "0x0000000000000000000000000000000000000000",
        warning: true,
        detail: process.env.HASHKEY_KYC_SBT_ADDRESS ? "configured" : "missing"
      },
      {
        name: "HSP_COORDINATOR_URL",
        ok: !!process.env.HSP_COORDINATOR_URL,
        warning: true,
        detail: process.env.HSP_COORDINATOR_URL ? "configured" : "missing"
      },
      {
        name: "HSP_API_KEY",
        ok: !!process.env.HSP_API_KEY,
        warning: true,
        detail: process.env.HSP_API_KEY ? "configured" : "missing"
      }
    ];
    const failed = checks.filter((check) => !check.ok && !check.warning);
    const warnings = checks.filter((check) => !check.ok && check.warning);

    showOrJson(command, { checks, failed: failed.length, warnings: warnings.length }, () => {
      console.log(kleur.bold("ProofPay doctor"));
      for (const check of checks) {
        const kind = check.ok ? "ok" : check.warning ? "warn" : "fail";
        console.log(`${symbol(kind)} ${check.name} ${kleur.dim(check.detail)}`);
      }
    });

    if (failed.length > 0 || (options.strict && warnings.length > 0)) {
      process.exitCode = 1;
    }
  });

program
  .command("demo")
  .description("run the local compliant settlement demo")
  .action(async (_options: unknown, command: Command) => {
    const { payer, recipient, token } = demoAddresses();
    const policy = demoPolicy();
    const evidence = {
      payer,
      recipient,
      token,
      chainId: 133,
      amount: 1_000_000n,
      observedAt: new Date(),
      satisfiedCapabilities: [
        "proves:hashkey-settlement:v1",
        "attests:kyc:v1",
        "attests:sanctions:v1"
      ]
    };
    const decision = await verifyWithPolicy({ policy, evidence });
    showOrJson(command, { policy, evidence, decision }, () => {
      console.log(kleur.bold("ProofPay compliant settlement demo"));
      printDecision(decision);
    });
    setDecisionExitCode(decision.ok);
  });

program
  .command("verify")
  .description("verify a policy against settlement evidence")
  .argument("<policy>", "policy JSON file")
  .argument("<evidence>", "settlement evidence JSON file")
  .option("--hsp", "treat evidence as HSP receipt/attestation bundle")
  .action(async (policyPath: string, evidencePath: string, options: { hsp?: boolean }, command: Command) => {
    const { policy, evidence, decision } = await runVerification({
      policyPath,
      evidencePath,
      hsp: options.hsp
    });
    showOrJson(command, { policy, evidence, decision }, () => printDecision(decision));
    setDecisionExitCode(decision.ok);
  });

program
  .command("verify-hsp")
  .description("verify a policy against an HSP receipt/attestation bundle")
  .argument("<policy>", "policy JSON file")
  .argument("<hsp-evidence>", "HSP evidence JSON file")
  .action(async (policyPath: string, evidencePath: string, _options: unknown, command: Command) => {
    const { policy, evidence, decision } = await runVerification({
      policyPath,
      evidencePath,
      hsp: true
    });
    showOrJson(command, { policy, evidence, decision }, () => printDecision(decision));
    setDecisionExitCode(decision.ok);
  });

const policy = program.command("policy").description("create and inspect ProofPay policies");

policy
  .command("create")
  .description("create a payment policy JSON document")
  .requiredOption("--recipient <address>", "recipient address")
  .requiredOption("--token <address>", "token address")
  .option("--id <id>", "policy id", "paid-alpha")
  .option("--chain-id <id>", "settlement chain id", "133")
  .option("--amount <baseUnits>", "amount in base units", "1000000")
  .option("--kyc-level <level>", "minimum KYC level", "ADVANCED")
  .option("--kyc-status <status>", "required KYC status", "APPROVED")
  .option("--capability <capability...>", "required capability", [
    "proves:hashkey-settlement:v1",
    "attests:kyc:v1",
    "attests:sanctions:v1"
  ])
  .option("--deadline <iso>", "deadline ISO timestamp", "2026-07-14T23:59:59.000Z")
  .option("-o, --output <path>", "write JSON to file")
  .action(async (options: Record<string, string | string[]>, command: Command) => {
    const value = {
      id: options.id,
      chainId: Number(options.chainId),
      recipient: options.recipient,
      token: options.token,
      amount: options.amount,
      minKycLevel: options.kycLevel,
      requiredKycStatus: options.kycStatus,
      requiredCapabilities: options.capability,
      deadline: options.deadline
    };
    if (typeof options.output === "string") {
      await writeJsonFile(options.output, value);
    }
    showOrJson(command, value, () => {
      console.log(kleur.bold("Created policy"));
      printKV([
        ["id", String(value.id)],
        ["chain", String(value.chainId)],
        ["amount", String(value.amount)],
        ["output", typeof options.output === "string" ? options.output : "stdout"]
      ]);
      if (!options.output) printJson(value);
    });
  });

const evidence = program.command("evidence").description("work with HSP evidence payloads");

evidence
  .command("encode")
  .description("encode HSP evidence JSON into ProofPay HTTP headers")
  .argument("<hsp-evidence>", "HSP evidence JSON file")
  .action(async (evidencePath: string, _options: unknown, command: Command) => {
    const value = await readJsonFile<{
      receipt: unknown;
      attestations?: unknown[];
    }>(evidencePath);
    const headers = {
      "ProofPay-Receipt": encodeBase64UrlJson(value.receipt),
      "ProofPay-Attestations": encodeBase64UrlJson(value.attestations ?? [])
    };
    showOrJson(command, headers, () => {
      console.log(`${kleur.bold("ProofPay headers")} ${kleur.dim("copy into curl or an agent request")}`);
      for (const [key, val] of Object.entries(headers)) {
        console.log(`${key}: ${val}`);
      }
    });
  });

program
  .command("kyc")
  .description("read HashKey KYC SBT status for an address")
  .argument("<address>", "wallet address")
  .action(async (address: Address, _options: unknown, command: Command) => {
    const provider = createHashKeyKycProviderFromEnv();
    const info = await provider.getKycInfo(address);
    showOrJson(command, info, () => {
      console.log(kleur.bold("HashKey KYC"));
      printKV([
        ["address", address],
        ["status", info.status],
        ["level", info.level],
        ["human", info.isHuman],
        ["ens", info.ensName || "none"],
        ["created", info.createdAt?.toISOString() ?? "none"]
      ]);
    });
  });

program
  .command("serve")
  .description("run a local paid API demo server")
  .option("-p, --port <port>", "port", "8787")
  .option("--policy <path>", "policy JSON file", "examples/policy.demo.json")
  .action(async (options: { port: string; policy: string }, command: Command) => {
    configureColor(command.optsWithGlobals<RootOptions>());
    const loadedPolicy = parsePolicy(await readJsonFile(options.policy));
    const trustPolicy = {
      pinnedAdapterOperators: ["0x4444444444444444444444444444444444444444" as Address],
      trustedIssuers: ["0x5555555555555555555555555555555555555555" as Address]
    };

    const server = http.createServer(async (req, res) => {
      if (req.url !== "/alpha") {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "not_found" }));
        return;
      }

      const receiptHeader = req.headers["proofpay-receipt"];
      if (!receiptHeader || Array.isArray(receiptHeader)) {
        const required = buildPaymentRequired(loadedPolicy);
        res.writeHead(required.status, required.headers);
        res.end(JSON.stringify(required.body, null, 2));
        return;
      }

      try {
        const receipt = JSON.parse(Buffer.from(receiptHeader, "base64url").toString("utf8"));
        const attestationsHeader = req.headers["proofpay-attestations"];
        const attestations =
          typeof attestationsHeader === "string"
            ? JSON.parse(Buffer.from(attestationsHeader, "base64url").toString("utf8"))
            : [];
        const normalized = normalizeHspEvidence({ receipt, attestations, trustPolicy });
        const decision = await verifyPaymentPolicy({
          policy: loadedPolicy,
          evidence: normalized,
          kycProvider: demoKycProvider(normalized.payer)
        });
        res.writeHead(decision.ok ? 200 : 402, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: decision.ok, decision }, null, 2));
      } catch (error) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_proofpay_evidence", message: String(error) }, null, 2));
      }
    });

    server.listen(Number(options.port), () => {
      console.log(`${kleur.green("ready")} ProofPay paid API on http://localhost:${options.port}/alpha`);
    });
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(kleur.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
