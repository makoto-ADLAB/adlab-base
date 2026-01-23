import crypto from "crypto"
import { json, setCookie, signNonceToken } from "../_lib/auth.js"
import { makeLoginMessage } from "../_lib/web3.js"

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method Not Allowed" })

  const nonce = crypto.randomBytes(16).toString("hex")
  const token = await signNonceToken({ nonce })

  // 5分で失効（nonce token）
  setCookie(res, "adlab_nonce", token, { maxAge: 60 * 5 })

  return json(res, 200, {
    nonce,
    message: makeLoginMessage(nonce),
    expiresInSec: 60 * 5,
  })
}
