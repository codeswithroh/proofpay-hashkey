import type { KycLevel, KycStatus } from "./types.js";

const levelRank: Record<KycLevel, number> = {
  NONE: 0,
  BASIC: 1,
  ADVANCED: 2,
  PREMIUM: 3,
  ULTIMATE: 4
};

export function satisfiesKycLevel(actual: KycLevel, required: KycLevel): boolean {
  return levelRank[actual] >= levelRank[required];
}

export function satisfiesKycStatus(actual: KycStatus, required: KycStatus): boolean {
  if (required === "NONE") {
    return true;
  }

  return actual === required;
}

