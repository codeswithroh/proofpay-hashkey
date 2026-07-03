import type { Address, KycInfo, KycProvider } from "./types.js";

export class StaticKycProvider implements KycProvider {
  constructor(private readonly records: Map<string, KycInfo>) {}

  async getKycInfo(account: Address): Promise<KycInfo> {
    const record = this.records.get(account.toLowerCase());
    if (record) {
      return record;
    }

    return {
      ensName: "",
      level: "NONE",
      status: "NONE",
      createdAt: null,
      isHuman: false
    };
  }
}

