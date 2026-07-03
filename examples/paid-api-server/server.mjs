import http from "node:http";
import { readFile } from "node:fs/promises";
import { StaticKycProvider, verifyPaymentPolicy, normalizeHspEvidence } from "../../packages/core/dist/index.js";
import { buildPaymentRequired } from "../../packages/http-middleware/dist/index.js";

const policyRaw = JSON.parse(await readFile(new URL("../policy.demo.json", import.meta.url), "utf8"));
const policy = {
  ...policyRaw,
  amount: BigInt(policyRaw.amount),
  deadline: new Date(policyRaw.deadline)
};

function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2));
}

function decodeHeader(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

const kycProvider = new StaticKycProvider(new Map([
  [
    "0x1111111111111111111111111111111111111111",
    {
      ensName: "demo.hashkey",
      level: "ADVANCED",
      status: "APPROVED",
      createdAt: new Date(),
      isHuman: true
    }
  ]
]));

http.createServer(async (req, res) => {
  if (req.url !== "/alpha") {
    sendJson(res, 404, { error: "not_found" });
    return;
  }

  const receipt = req.headers["proofpay-receipt"];
  if (!receipt) {
    const required = buildPaymentRequired(policy);
    sendJson(res, required.status, required.body, required.headers);
    return;
  }

  try {
    const evidence = normalizeHspEvidence({
      receipt: decodeHeader(receipt),
      attestations: req.headers["proofpay-attestations"]
        ? decodeHeader(req.headers["proofpay-attestations"])
        : [],
      trustPolicy: {
        pinnedAdapterOperators: ["0x4444444444444444444444444444444444444444"],
        trustedIssuers: ["0x5555555555555555555555555555555555555555"]
      }
    });
    const decision = await verifyPaymentPolicy({ policy, evidence, kycProvider });

    if (!decision.ok) {
      sendJson(res, 402, { error: "payment_rejected", decision });
      return;
    }

    sendJson(res, 200, {
      alpha: "HashKey compliant settlement verified. Ship the protected response.",
      decision
    });
  } catch (error) {
    sendJson(res, 400, { error: "invalid_proofpay_evidence", message: error.message });
  }
}).listen(8787, () => {
  console.log("ProofPay paid API example listening on http://localhost:8787/alpha");
});

