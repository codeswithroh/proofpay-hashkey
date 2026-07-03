# CLI Design References

The ProofPay CLI borrows practical patterns from established developer tools:

- Command Line Interface Guidelines: https://clig.dev/
- GitHub CLI formatting model: https://cli.github.com/manual/gh_help_formatting
- Vercel CLI task-oriented command model: https://vercel.com/docs/cli
- Stripe CLI local development workflow: https://docs.stripe.com/cli
- Thoughtworks CLI design guidance: https://www.thoughtworks.com/en-us/insights/blog/engineering-effectiveness/elevate-developer-experiences-cli-design-guidelines

Applied decisions:

- Human-readable output by default.
- `--json` for automation and agents.
- Noun/verb command groups such as `policy create` and `evidence encode`.
- Kebab-case flags.
- Non-zero exit code when verification rejects a payment.
- Local `serve` and `demo` commands to make judging and integration testing fast.

