import { json, getCookie, verifyAuthToken } from "../../_lib/auth.js"
import { supabase } from "../../_lib/supabase.js"

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
  if (!auth) return json(res, 401, { error: "SBT login required" })

  const slug = req.query?.slug
  if (!slug) return json(res, 400, { error: "Missing slug" })

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) return json(res, 404, { error: "Not found" })

  const viewer = auth.address.toLowerCase()
  const owner = (data.owner_address || "").toLowerCase()

  // ownerなら何でも見れる
  if (viewer === owner) return json(res, 200, { project: data })

  // 他人は approved のみ（将来用）。現時点では承認機能未実装なので基本見えない。
  if (data.status !== "approved") {
    return json(res, 403, { error: "Not accessible" })
  }

  return json(res, 200, { project: data })
}
