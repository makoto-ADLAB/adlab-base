import { SignJWT, jwtVerify } from "jose"

const secretStr = process.env.JWT_SECRET
if (!secretStr) throw new Error("Missing JWT_SECRET")

const secret = new TextEncoder().encode(secretStr)

export function setCookie(res, name, value, opts = {}) {
  const {
    httpOnly = true,
    secure = true,
    sameSite = "Lax",
    path = "/",
    maxAge, // seconds
  } = opts

  let cookie = `${name}=${value}; Path=${path}; SameSite=${sameSite};`
  if (httpOnly) cookie += " HttpOnly;"
  if (secure) cookie += " Secure;"
  if (typeof maxAge === "number") cookie += ` Max-Age=${maxAge};`
  res.setHeader("Set-Cookie", cookie)
}

export function getCookie(req, name) {
  const raw = req.headers.cookie || ""
  const parts = raw.split(";").map((s) => s.trim())
  for (const p of parts) {
    if (p.startsWith(name + "=")) return p.slice(name.length + 1)
  }
  return null
}

// 短命nonceトークン（5分）
export async function signNonceToken({ nonce }) {
  return await new SignJWT({ nonce })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret)
}

export async function verifyNonceToken(token) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

// 認証JWT（7日）
export async function signAuthToken({ address }) {
  return await new SignJWT({ address })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(address.toLowerCase())
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyAuthToken(token) {
  const { payload } = await jwtVerify(token, secret)
  if (!payload?.address) throw new Error("Invalid token payload")
  return payload
}

export function json(res, status, data) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  res.end(JSON.stringify(data))
}
