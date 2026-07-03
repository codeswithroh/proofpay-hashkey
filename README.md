# ProofPay HashKey

ProofPay is a backend-first toolkit for verifiable compliant settlement on HashKey Chain.

It combines:

- HashKey Chain KYC SBT checks for human/KYC status and verification level.
- HSP mandates, receipts, attestations, and pure verification.
- x402-style paid API middleware for agents and applications.
- Optional CCIP-aware cross-chain funding routes into HashKey settlement.

The project is intentionally package-first: no UI is required for the hackathon demo.

## Packages

- `@proofpay/core`: policy types, verifier decisions, HashKey KYC adapter interfaces, and HSP receipt validation helpers.
- `@proofpay/hashkey`: viem-powered HashKey KYC SBT provider.
- `@proofpay/cli`: command-line demos for checking policies and explaining settlement decisions.
- `@proofpay/http-middleware`: HTTP middleware primitives for paid APIs and AI-agent workflows.

## Quick Smoke Tests

```bash
npm install
npm run build
npm test
node packages/cli/dist/index.js doctor
node packages/cli/dist/index.js demo
node packages/cli/dist/index.js verify-hsp examples/policy.demo.json examples/hsp-evidence.demo.json
node packages/cli/dist/index.js evidence encode examples/hsp-evidence.demo.json
```

See [CLI docs](docs/cli.md) for the full command surface.
See [environment setup](docs/env-setup.md) for required HSP/HashKey keys.

## Current Hackathon Thesis

Generic payment apps can be deployed on any EVM chain. ProofPay should demonstrate something chain-specific:

> A service can ship only after an independently verifiable HashKey settlement receipt proves the payment happened and HashKey-native compliance requirements were satisfied.

That is the unlock: KYC-aware, receipt-backed, agent-compatible settlement.
