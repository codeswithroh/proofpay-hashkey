# HashKey Testnet Pins

## Network

- Network name: HashKey Chain Testnet
- RPC endpoint: `https://testnet.hsk.xyz`
- Chain ID: `133`
- Native token: `HSK`
- Explorer: `https://testnet-explorer.hsk.xyz`

## Local Demo Wallet

- Demo wallet address derived from local private key: `0xc455E7DB5aca52559fb8D008af52e7Abe976ac1A`
- Safe prefix: `HSKT`
- Safe address: `0x685c3f57899d14972aFf79038507FaFBfE481703`

The private key is stored only in local `.env`, which is gitignored.

## HashKey Contracts

- Pull contract: `0x443A0f4Da5d2fdC47de3eeD45Af41d399F0E5702`
- Storage contract: `0x6Cd59830AAD978446e6cc7f6cc173aF7656Fb917`
- Verifier proxy: `0xE02A72Be64DA496797821f1c4BB500851C286C6c`

## Chainlink Price Feeds

| Pair | Deviation | Heartbeat | Contract |
|---|---:|---:|---|
| BTC/USD | 0.5% | 4h | `0x64697A6Abb508079687465FA9EF99D2Da955D791` |
| USDT/USD | 0.5% | 4h | `0xC45D520D18A465Ec23eE99A58Dc4cB96b357E744` |
| USDC/USD | 0.1% | 24h | `0xCdB10dC9dB30B6ef2a63aB4460263655808fAE27` |

## Still Needed

The attached HSP guide says the organizer provides these once the sandbox deployment is ready:

- HSP Coordinator URL
- HSP API key
- HSP faucet URL
- HSP facilitator URL
- adapter address to pin, also discoverable from `GET /chains`

The KYC guide includes the SBT interface but does not include a deployed `KYC_SBT_ADDRESS`; we still need that address from HashKey if we want live KYC SBT reads.

