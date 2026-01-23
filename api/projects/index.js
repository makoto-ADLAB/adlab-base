import { json, getCookie, verifyAuthToken } from "../_lib/auth.js"
import { supabase } from "../_lib/supabase.js"

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function randSuffix() {
  return Math.random().toString(36).slice(2, 8)
}

async function requireAuth(req, res) {
  const token = getCookie(req, "adlab_token") || (req.headers.authorization || "").replace(/^Bearer\s+/i, "")
  if (!token) return null
  try {
    return await verifyAuthToken(token)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  const auth = await requireAuth(req, res)
  if (!auth) return json(res, 401, { error: "Unauthorized" })

  const owner = auth.address.toLowerCase()

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_address", owner)
      .order("updated_at", { ascending: false })

    if (error) return json(res, 500, { error: error.message })
    return json(res, 200, { projects: data || [] })
  }

  if (req.method === "POST") {
    let body = ""
    req.on("data", (c) => (body += c))
    await new Promise((r) => req.on("end", r))
    let input = {}
    try { input = JSON.parse(body || "{}") } catch {}

    const title = String(input.title || "").trim() || "Untitled Project"
    const tagline = String(input.tagline || "").trim()
    const base = slugify(title) || "project"
    const slug = `${base}-${randSuffix()}`

    const row = {
      owner_address: owner,
      slug,
      title,
      tagline,
      cover_image_url: input.cover_image_url || null,
      story_md: input.story_md || "",
      vision_md: input.vision_md || "",
      plan_json: input.plan_json || {},
      token_json: input.token_json || {},
      status: "draft",
    }

    const { data, error } = await supabase
      .from("projects")
      .insert(row)
      .select("*")
      .single()

    if (error) return json(res, 500, { error: error.message })
    return json(res, 201, { project: data })
  }

  return json(res, 405, { error: "Method Not Allowed" })
}
