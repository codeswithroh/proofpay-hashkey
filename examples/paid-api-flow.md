# Paid API Flow

This is the first backend-only demo target.

1. Client requests `GET /alpha`.
2. Server replies with HTTP `402` and a ProofPay policy.
3. Agent creates an HSP payment for the policy.
4. Agent settles on HashKey Chain.
5. Agent retries `GET /alpha` with settlement evidence headers.
6. Middleware verifies HSP evidence and HashKey KYC state.
7. Server returns the paid response.

Future header shape:

```http
ProofPay-Mandate-Hash: 0x...
ProofPay-Receipt: base64url(...)
ProofPay-Attestations: base64url(...)
```

