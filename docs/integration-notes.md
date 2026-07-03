# Integration Notes

## Live HashKey KYC

Use `@proofpay/hashkey` when `HASHKEY_KYC_SBT_ADDRESS` is known:

```ts
import { createHashKeyKycProviderFromEnv } from "@proofpay/hashkey";

const kycProvider = createHashKeyKycProviderFromEnv();
const info = await kycProvider.getKycInfo("0x...");
```

Environment:

- `HASHKEY_CHAIN`: `testnet` or `mainnet`; defaults to testnet.
- `HASHKEY_RPC_URL`: optional custom RPC URL.
- `HASHKEY_KYC_SBT_ADDRESS`: deployed KYC SBT contract.

## HSP Evidence Boundary

ProofPay currently accepts normalized HSP-like evidence:

- `receipt.adapterAddress` must be pinned.
- `receipt.outcome` must be `SETTLED`.
- receipt settlement fields become `SettlementEvidence`.
- trusted, unexpired attestations add satisfied capabilities.

When using `@hsp/sdk`, map the SDK snapshot into this shape:

```ts
normalizeHspEvidence({
  receipt,
  attestations,
  trustPolicy: {
    pinnedAdapterOperators: [adapterAddressFromGetChains],
    trustedIssuers: [issuerFromGetIssuers]
  }
});
```

Do not trust coordinator payment status by itself. Use coordinator reads as a source of wire objects, then verify with pinned adapter and issuer keys.

## Paid API Headers

`@proofpay/http-middleware` expects:

- `ProofPay-Receipt`: base64url JSON HSP receipt.
- `ProofPay-Attestations`: optional base64url JSON array of attestations.

The demo server in `examples/paid-api-server` shows the no-UI flow:

- missing evidence -> `402 Payment Required`
- valid evidence -> `200 OK`
- invalid or insufficient evidence -> rejection with decision reasons

