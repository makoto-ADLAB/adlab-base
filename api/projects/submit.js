import { json, getCookie, verifyAuthToken } from "../_lib/auth.js"
import { supabase } from "../_lib/supabase.js"

async function requireAuth(req) {
  const token = getCookie(req, "adlab_token") || (req.headers.authorization || "").replace(/^Bearer\s+/i, "")
  if (!token) return null
  try {
    return await verifyAuthToken(token)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method Not Allowed" })

  const auth = await requireAuth(req)
  if (!auth) return json(res, 401, { error: "Unauthorized" })

  let body = ""
  req.on("data", (c) => (body += c))
  await new Promise((r) => req.on("end", r))
  let input = {}
  try { input = JSON.parse(body || "{}") } catch {}

  const id = input.id
  if (!id) return json(res, 400, { error: "Missing id" })

  const owner = auth.address.toLowerCase()

  const { data: existing, error: e0 } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (e0) return json(res, 404, { error: "Not found" })
  if ((existing.owner_address || "").toLowerCase() !== owner) return json(res, 403, { error: "Forbidden" })

  if (existing.status !== "draft") {
    return json(res, 409, { error: `Only draft can be submitted. status=${existing.status}` })
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single()

  if (error) return json(res, 500, { error: error.message })
  return json(res, 200, { project: data })
}
