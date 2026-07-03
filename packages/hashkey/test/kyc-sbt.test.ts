import { describe, expect, it } from "vitest";
import { createHashKeyKycProviderFromEnv } from "../src/index.js";

describe("createHashKeyKycProviderFromEnv", () => {
  it("requires an SBT address", () => {
    expect(() => createHashKeyKycProviderFromEnv({})).toThrow("HASHKEY_KYC_SBT_ADDRESS");
  });
});

