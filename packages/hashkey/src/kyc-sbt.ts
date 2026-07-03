import type { Address, KycInfo, KycLevel, KycProvider, KycStatus } from "@proofpay/core";
import { createPublicClient, http, type Chain, type PublicClient, type Transport } from "viem";
import { hashkey, hashkeyTestnet } from "viem/chains";

export const kycSbtAbi = [
  {
    type: "function",
    name: "getKycInfo",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "ensName", type: "string" },
      { name: "level", type: "uint8" },
      { name: "status", type: "uint8" },
      { name: "createTime", type: "uint256" }
    ]
  },
  {
    type: "function",
    name: "isHuman",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "isValid", type: "bool" },
      { name: "level", type: "uint8" }
    ]
  }
] as const;

const kycLevels: KycLevel[] = ["NONE", "BASIC", "ADVANCED", "PREMIUM", "ULTIMATE"];
const kycStatuses: KycStatus[] = ["NONE", "APPROVED", "REVOKED"];

function toKycLevel(value: number): KycLevel {
  return kycLevels[value] ?? "NONE";
}

function toKycStatus(value: number): KycStatus {
  return kycStatuses[value] ?? "NONE";
}

export interface HashKeyKycProviderOptions {
  sbtAddress: Address;
  chain?: Chain;
  rpcUrl?: string;
  client?: PublicClient<Transport, Chain>;
}

export class HashKeyKycProvider implements KycProvider {
  private readonly client: PublicClient<Transport, Chain>;
  private readonly sbtAddress: Address;

  constructor(options: HashKeyKycProviderOptions) {
    this.sbtAddress = options.sbtAddress;
    this.client =
      options.client ??
      createPublicClient({
        chain: options.chain ?? hashkeyTestnet,
        transport: http(options.rpcUrl)
      });
  }

  async getKycInfo(account: Address): Promise<KycInfo> {
    const [info, human] = await Promise.all([
      this.client.readContract({
        address: this.sbtAddress,
        abi: kycSbtAbi,
        functionName: "getKycInfo",
        args: [account]
      }),
      this.client.readContract({
        address: this.sbtAddress,
        abi: kycSbtAbi,
        functionName: "isHuman",
        args: [account]
      })
    ]);

    const [, humanLevel] = human;
    const kycLevel = Math.max(Number(info[1]), Number(humanLevel));
    const createdAtSeconds = Number(info[3]);

    return {
      ensName: info[0],
      level: toKycLevel(kycLevel),
      status: toKycStatus(Number(info[2])),
      createdAt: createdAtSeconds > 0 ? new Date(createdAtSeconds * 1000) : null,
      isHuman: human[0]
    };
  }
}

export function createHashKeyKycProviderFromEnv(env: NodeJS.ProcessEnv = process.env): HashKeyKycProvider {
  const sbtAddress = env.HASHKEY_KYC_SBT_ADDRESS as Address | undefined;
  if (!sbtAddress || sbtAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("HASHKEY_KYC_SBT_ADDRESS must be configured.");
  }

  const chain = env.HASHKEY_CHAIN === "mainnet" ? hashkey : hashkeyTestnet;
  return new HashKeyKycProvider({
    sbtAddress,
    chain,
    rpcUrl: env.HASHKEY_RPC_URL
  });
}

