# Paid API Server Example

This example is intentionally tiny: it shows the backend flow without UI.

```bash
npm run build
node examples/paid-api-server/server.mjs
```

Then request:

```bash
curl -i http://localhost:8787/alpha
```

The server returns a `402` ProofPay policy until a valid `ProofPay-Receipt` header is supplied.

