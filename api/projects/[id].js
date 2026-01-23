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
  const auth = await requireAuth(req)
  if (!auth) return json(res, 401, { error: "Unauthorized" })

  const owner = auth.address.toLowerCase()
  const id = req.query?.id
  if (!id) return json(res, 400, { error: "Missing id" })

  // まず所有チェック
  const { data: existing, error: e0 } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (e0) return json(res, 404, { error: "Not found" })
  if ((existing.owner_address || "").toLowerCase() !== owner) {
    return json(res, 403, { error: "Forbidden" })
  }

  if (req.method === "GET") {
    return json(res, 200, { project: existing })
  }

  if (req.method === "PATCH") {
    let body = ""
    req.on("data", (c) => (body += c))
    await new Promise((r) => req.on("end", r))
    let input = {}
    try { input = JSON.parse(body || "{}") } catch {}

    // draft / needs_changes のみ更新可能（運用ルール）
    const status = existing.status
    if (!["draft", "needs_changes"].includes(status)) {
      return json(res, 409, { error: `Cannot edit when status=${status}` })
    }

    const update = {}
    const fields = [
      "title",
      "tagline",
      "cover_image_url",
      "story_md",
      "vision_md",
      "plan_json",
      "token_json",
    ]
    for (const f of fields) if (f in input) update[f] = input[f]

    const { data, error } = await supabase
      .from("projects")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()

    if (error) return json(res, 500, { error: error.message })
    return json(res, 200, { project: data })
  }

  return json(res, 405, { error: "Method Not Allowed" })
}
