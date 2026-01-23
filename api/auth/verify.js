import { json, getCookie, setCookie, verifyNonceToken, signAuthToken } from "../_lib/auth.js"
import { verifySignature, makeLoginMessage, checkSbtBalance } from "../_lib/web3.js"

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method Not Allowed" })

  let body = ""
  req.on("data", (c) => (body += c))
  await new Promise((r) => req.on("end", r))

  let data
  try {
    data = JSON.parse(body || "{}")
  } catch {
    return json(res, 400, { error: "Invalid JSON" })
  }

  const { address, signature } = data
  if (!address || !signature) return json(res, 400, { error: "Missing address/signature" })

  const nonceToken = getCookie(req, "adlab_nonce")
  if (!nonceToken) return json(res, 401, { error: "Missing nonce cookie" })

  let payload
  try {
    payload = await verifyNonceToken(nonceToken)
  } catch (e) {
    return json(res, 401, { error: "Invalid/expired nonce" })
  }

  const nonce = payload.nonce
  const message = makeLoginMessage(nonce)

  const ok = await verifySignature({ address, message, signature })
  if (!ok) return json(res, 401, { error: "Signature verification failed" })

  // ✅ Base上のSBT保有チェック
  let bal = 0n
  try {
    bal = await checkSbtBalance(address)
  } catch (e) {
    return json(res, 500, { error: "Failed to read SBT contract (Base RPC / address)" })
  }

  if (bal <= 0n) {
    return json(res, 403, { error: "SBT required", balanceOf: bal.toString() })
  }

  // ✅ 認証JWT発行（7日）
  const authToken = await signAuthToken({ address: address.toLowerCase() })

  // httpOnly cookie（フロントから読めない。APIが守る）
  setCookie(res, "adlab_token", authToken, { maxAge: 60 * 60 * 24 * 7 })

  // nonce cookieは不要なのでクリア（Max-Age=0）
  setCookie(res, "adlab_nonce", "", { maxAge: 0 })

  return json(res, 200, {
    ok: true,
    address: address.toLowerCase(),
    balanceOf: bal.toString(),
  })
}
