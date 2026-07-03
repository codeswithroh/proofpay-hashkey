# Product Spec

## Working Name

ProofPay: compliant settlement that agents can verify.

## One-Liner

ProofPay lets an API, merchant, invoice, or DeFi protocol accept payment only when an HSP receipt proves settlement on HashKey Chain and HashKey-native KYC/compliance policy is satisfied.

## Primary Demo

An AI agent requests a paid financial API endpoint.

1. The endpoint returns a payment requirement.
2. The agent prepares and signs an HSP mandate.
3. The payer settles USDC on HashKey Chain.
4. HSP observes the transaction and returns a receipt.
5. ProofPay checks the receipt, attestations, and HashKey KYC SBT state.
6. The endpoint returns data only if the policy is accepted.

## Why HashKey-Specific

The demo depends on three things that are not generic EVM features:

- HashKey Chain KYC SBT: on-chain verification level and status.
- HSP: verifiable mandate/receipt/attestation settlement layer.
- HashKey CCIP support: cross-chain payment routes can converge into compliant HashKey settlement.

## Deliverables

- Core TypeScript SDK.
- CLI verifier/demo.
- HTTP middleware for paid APIs.
- HSP adapter boundary.
- HashKey KYC checker.
- Example paid API flow.
- Threat model and security notes.
- Optional npm-ready package metadata.

