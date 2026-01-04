import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(), // MetaMask / Coinbase Wallet(拡張) / Brave Wallet など
  ],
  transports: {
    [base.id]: http(),
  },
})