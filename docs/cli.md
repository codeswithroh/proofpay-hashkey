# ProofPay CLI

ProofPay CLI is designed around two modes:

- Friendly terminal output for humans.
- Stable JSON output for scripts and agents via `--json`.

## Commands

```bash
proofpay doctor
proofpay demo
proofpay policy create --recipient 0x... --token 0x...
proofpay verify examples/policy.demo.json examples/hsp-evidence.demo.json --hsp
proofpay verify-hsp examples/policy.demo.json examples/hsp-evidence.demo.json
proofpay evidence encode examples/hsp-evidence.demo.json
proofpay serve --port 8787
proofpay kyc 0x...
```

## Exit Codes

- `0`: command succeeded, or verification accepted.
- `1`: command failed.
- `2`: verification ran successfully but rejected the payment.

## Design Notes

The CLI follows common modern conventions from tools like GitHub CLI, Vercel CLI, and Stripe CLI:

- noun/verb command groups
- kebab-case flags
- script-safe `--json`
- concise default output
- explicit local demo commands
- strict separation between local mock verification and live HashKey KYC reads

See [CLI design references](cli-design-references.md) for the source material.

## Paid API Header Flow

Generate headers from demo HSP evidence:

```bash
proofpay evidence encode examples/hsp-evidence.demo.json
```

Use those headers against a protected endpoint:

```bash
proofpay serve
curl -i http://localhost:8787/alpha
```
