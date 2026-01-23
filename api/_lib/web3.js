import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { verifyMessage } from "viem"

const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org"

// ADLAB SBT（Base上）
export const SBT_CONTRACT = "0x7Db34db211f767484c8Ca9AC3Ef801C74D813488"

export const sbtAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
]

export const baseClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
})

export async function checkSbtBalance(address) {
  const bal = await baseClient.readContract({
    address: SBT_CONTRACT,
    abi: sbtAbi,
    functionName: "balanceOf",
    args: [address],
  })
  return BigInt(bal || 0n)
}

export async function verifySignature({ address, message, signature }) {
  return await verifyMessage({
    address,
    message,
    signature,
  })
}

export function makeLoginMessage(nonce) {
  // 署名メッセージは固定テンプレートにする（検証が確実になる）
  return `ADLAB BASE Login

This signature is free (no gas) and proves you control this wallet.

Nonce: ${nonce}`
}
