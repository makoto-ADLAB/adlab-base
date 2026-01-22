// src/wagmi.js
import { http, createConfig } from "wagmi"
import { mainnet, polygon } from "wagmi/chains"
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors"
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient()

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const config = createConfig({
  chains: [mainnet, polygon],
  connectors: [
    // MetaMask / Brave Wallet / 既にブラウザに入ってるウォレット
    injected(),

    // Coinbase Wallet
    coinbaseWallet({ appName: "ADLAB BASE" }),

    // WalletConnect (スマホウォレット/QR/アプリ連携)
    walletConnect({
      projectId,
      showQrModal: true, // ← QRを出したいなら true
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
})
