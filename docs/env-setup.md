# Environment Setup

The CLI auto-loads `.env` from the repo root.

## Already Set

These values are public defaults and are already filled in `.env`:

- `HASHKEY_CHAIN=testnet`
- `HASHKEY_RPC_URL=https://testnet.hsk.xyz`
- `HSP_CHAIN=hashkey-testnet`
- `HSP_STABLECOIN_HASHKEY_TESTNET=0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6:USDC:6`
- `HSP_STABLECOIN_HASHKEY=0x054ed45810DbBAb8B27668922D110669c9D88D0a:USDC.e:6`
- `HASHKEY_SAFE_ADDRESS=0x685c3f57899d14972aFf79038507FaFBfE481703`
- `HASHKEY_PULL_CONTRACT=0x443A0f4Da5d2fdC47de3eeD45Af41d399F0E5702`
- `HASHKEY_STORAGE_CONTRACT=0x6Cd59830AAD978446e6cc7f6cc173aF7656Fb917`
- `HASHKEY_VERIFIER_PROXY_ADDRESS=0xE02A72Be64DA496797821f1c4BB500851C286C6c`
- HashKey testnet Chainlink feed addresses for BTC/USD, USDT/USD, and USDC/USD.

The local `.env` also contains your demo private key for scripts. It is gitignored and must not be committed.

See [HashKey testnet pins](hashkey-testnet.md) for the configured network, Safe, contract, verifier, and oracle addresses.

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
