# Environment Setup

The CLI auto-loads `.env` from the repo root.

## Already Set

These values are public defaults and are already filled in `.env`:

- `HASHKEY_CHAIN=testnet`
- `HASHKEY_RPC_URL=https://testnet.hsk.xyz`
- `HSP_CHAIN=hashkey-testnet`
- `HSP_STABLECOIN_HASHKEY_TESTNET=0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6:USDC:6`
- `HSP_STABLECOIN_HASHKEY=0x054ed45810DbBAb8B27668922D110669c9D88D0a:USDC.e:6`

## Needed From You

Ask the HashKey/HSP hackathon team or deployment docs for:

- `HSP_COORDINATOR_URL`: Coordinator base URL.
- `HSP_API_KEY`: your team write key. This is not a wallet private key.
- `HSP_PINNED_ADAPTER_ADDRESS`: from `GET <HSP_COORDINATOR_URL>/chains`.
- `HSP_COMPLIANCE_ISSUER`: from `GET <HSP_ISSUER_URL>/issuer`, or set both `HSP_KYC_ISSUER` and `HSP_SANCTIONS_ISSUER`.
- `HASHKEY_KYC_SBT_ADDRESS`: official HashKey KYC SBT contract address if we want live KYC SBT reads through `proofpay kyc`.

Optional service URLs:

- `HSP_ISSUER_URL`: mock issuer service.
- `HSP_FACILITATOR_URL`: x402 facilitator.
- `HSP_FAUCET_URL`: faucet for testnet gas + USDC.

## Commands

```bash
cd /Users/rohitpurkait/Documents/Codex/2026-07-03/hac/proofpay-hashkey
node packages/cli/dist/index.js doctor
```

After setting `HSP_COORDINATOR_URL`, fetch the adapter address:

```bash
curl "$HSP_COORDINATOR_URL/chains"
```

After setting `HSP_ISSUER_URL`, fetch the issuer address:

```bash
curl "$HSP_ISSUER_URL/issuer"
```

