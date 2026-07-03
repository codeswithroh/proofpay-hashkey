# Security Notes

## Trust Boundaries

- Do not trust a hosted Coordinator's status string alone.
- Pin the HSP adapter address used for receipt verification.
- Treat KYC SBT reads as chain state, not as user-provided claims.
- Never put private keys in the HSP MCP server or HTTP middleware.
- Keep payer signing external: wallet, wallet MCP, or controlled server signer for demos only.

## Early Threats

- Replay of an old receipt against a new API request.
- Payment to the wrong recipient.
- Matching a settlement from an address different from the mandate signer.
- KYC revoked after a cached approval.
- Attestation issuer spoofing.
- Cross-chain route completes but final HashKey settlement does not.

## Mitigations

- Include nonce, deadline, chain, token, recipient, and amount in payment policy.
- Use mandate hash as the idempotency key.
- Re-read KYC status at decision time.
- Pin trusted HSP adapter and attestation issuer addresses.
- Cache only negative/expired decisions freely; cache positive decisions for short windows.

