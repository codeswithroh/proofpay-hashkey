import type {
  Address,
  Capability,
  HspAttestationLike,
  HspReceiptLike,
  SettlementEvidence,
  TrustPolicy
} from "../types.js";

function lowerAddress(address: Address): Address {
  return address.toLowerCase() as Address;
}

function parseDate(value: Date | number | string | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value > 10_000_000_000 ? value : value * 1000);
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return parseDate(numeric);
  }

  return new Date(value);
}

function isTrusted(address: Address, trusted: Address[]): boolean {
  const normalized = lowerAddress(address);
  return trusted.some((candidate) => lowerAddress(candidate) === normalized);
}

export function collectTrustedCapabilities(args: {
  attestations: HspAttestationLike[];
  trustPolicy: Pick<TrustPolicy, "trustedIssuers">;
  subject: Address;
  now?: Date;
}): Capability[] {
  const now = args.now ?? new Date();
  const subject = lowerAddress(args.subject);

  return args.attestations
    .filter((attestation) => isTrusted(attestation.issuer, args.trustPolicy.trustedIssuers))
    .filter((attestation) => lowerAddress(attestation.subject) === subject)
    .filter((attestation) => {
      const issuedAt = parseDate(attestation.issuedAt);
      const expiresAt = parseDate(attestation.expiresAt);
      return (!issuedAt || issuedAt <= now) && (!expiresAt || expiresAt > now);
    })
    .map((attestation) => attestation.capability);
}

export function normalizeHspEvidence(args: {
  receipt: HspReceiptLike;
  attestations?: HspAttestationLike[];
  trustPolicy: TrustPolicy;
  now?: Date;
}): SettlementEvidence {
  if (!isTrusted(args.receipt.adapterAddress, args.trustPolicy.pinnedAdapterOperators)) {
    throw new Error("HSP receipt adapter operator is not pinned in trust policy.");
  }

  if (args.receipt.outcome !== "SETTLED") {
    throw new Error(`HSP receipt outcome must be SETTLED, got ${args.receipt.outcome}.`);
  }

  const attestedCapabilities = collectTrustedCapabilities({
    attestations: args.attestations ?? [],
    trustPolicy: args.trustPolicy,
    subject: args.receipt.settlement.payer,
    now: args.now
  });

  return {
    payer: args.receipt.settlement.payer,
    recipient: args.receipt.settlement.recipient,
    token: args.receipt.settlement.token,
    amount: BigInt(args.receipt.settlement.amount),
    chainId: args.receipt.settlement.chainId,
    observedAt: parseDate(args.receipt.settledAt) ?? new Date(0),
    mandateHash: args.receipt.mandateHash,
    receiptId: args.receipt.settlement.txHash,
    satisfiedCapabilities: [
      ...(args.receipt.satisfiedCapabilities ?? []),
      ...attestedCapabilities
    ]
  };
}

