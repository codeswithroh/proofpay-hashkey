# Roadmap

## Phase 0: Groundwork

- Public GitHub repository.
- npm workspace with package boundaries.
- CI for typecheck, tests, and build.
- Resource map for HashKey, HSP, KYC, CCIP, and idea-bank inputs.
- Security notes and initial threat model.

## Phase 1: Core SDK

- `PaymentPolicy` schema.
- `SettlementEvidence` schema.
- `VerificationDecision` model.
- Capability subset checks.
- KYC level/status checks.
- HashKey `KycSBT` viem provider.
- HSP receipt/attestation decoder boundary.

## Phase 2: HSP Integration

- Adapter for HSP SDK objects.
- Mandate builder wrapper.
- Receipt normalizer.
- Trusted adapter pinning.
- Compliance capability mapping:
  - `attests:kyc:v1`
  - `attests:sanctions:v1`
  - `proves:hashkey-settlement:v1`

## Phase 3: Paid API Middleware

- HTTP `402` requirement response builder.
- Header decoder for mandate hash, receipt, and attestations.
- Express/Fastify/fetch-compatible helpers.
- Example protected endpoint.

## Phase 4: CLI

- `proofpay explain <payment.json>`
- `proofpay verify <policy.json> <evidence.json>`
- `proofpay kyc <address>`
- `proofpay demo paid-api`

## Phase 5: npm Publishing

Package candidates:

- `@proofpay/core`
- `@proofpay/hashkey`
- `@proofpay/hsp`
- `@proofpay/http-middleware`
- `@proofpay/cli`

Keep packages private until the HSP API surface is stable enough for external users. Use `0.x` semver during the hackathon.

## Phase 6: Hackathon Demo

- Agent attempts to access paid alpha endpoint.
- Endpoint returns ProofPay policy.
- Agent prepares HSP payment.
- HashKey settlement succeeds.
- ProofPay verifies receipt + KYC + compliance capabilities.
- API returns protected result.
- Second run shows rejection when KYC is revoked, insufficient, or missing sanctions attestation.

