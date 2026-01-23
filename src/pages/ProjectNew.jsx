import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount, useReadContract } from "wagmi"

const SBT_CONTRACT = "0x7Db34db211f767484c8Ca9AC3Ef801C74D813488"
const sbtAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
]

function slugify(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function ProjectNew() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()

  // SBT gate
  const read = useReadContract({
    address: SBT_CONTRACT,
    abi: sbtAbi,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
  })
  const hasSbt = read.data ? BigInt(read.data) > 0n : false

  useEffect(() => {
    if (read.isLoading) return
    if (!isConnected) navigate("/", { replace: true })
    if (isConnected && !hasSbt) navigate("/", { replace: true })
  }, [isConnected, hasSbt, read.isLoading, navigate])

  // form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [tagline, setTagline] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [storyMd, setStoryMd] = useState("")
  const [visionMd, setVisionMd] = useState("")
  const [planJsonText, setPlanJsonText] = useState("{}")
  const [tokenJsonText, setTokenJsonText] = useState("{}")

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [created, setCreated] = useState(null) // { id, slug, status }

  const autoSlug = useMemo(() => slugify(title), [title])

  useEffect(() => {
    // slugが空の時だけ自動補完（手入力も尊重）
    if (!slug.trim()) setSlug(autoSlug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSlug])

  function safeParseJson(text) {
    try {
      return { ok: true, value: JSON.parse(text) }
    } catch (e) {
      return { ok: false, error: e?.message || "Invalid JSON" }
    }
  }

  async function saveDraft() {
    setMsg("")
    setSaving(true)
    try {
      const plan = safeParseJson(planJsonText)
      const token = safeParseJson(tokenJsonText)
      if (!plan.ok) throw new Error(`plan_json: ${plan.error}`)
      if (!token.ok) throw new Error(`token_json: ${token.error}`)

      // ★ここが重要：APIは同一ドメインなので /api/... でOK
      // かつ cookie(JWT) を送るため credentials: "include"
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug: slug.trim(),
          title: title.trim(),
          tagline: tagline.trim(),
          cover_image_url: coverImageUrl.trim() || null,
          story_md: storyMd,
          vision_md: visionMd,
          plan_json: plan.value,
          token_json: token.value,
          status: "draft",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Save failed")

      setCreated({ id: data.id, slug: data.slug, status: data.status })
      setMsg("✅ Draft saved")
    } catch (e) {
      setMsg(`❌ ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function submit() {
    if (!created?.id) {
      setMsg("先に Save Draft を押して、IDを作ってください。")
      return
    }
    setMsg("")
    setSaving(true)
    try {
      const res = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: created.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Submit failed")
      setCreated((p) => ({ ...p, status: data.status || "submitted" }))
      setMsg("✅ Submitted. ADLAB側の審査待ちです。")
    } catch (e) {
      setMsg(`❌ ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (!isConnected || read.isLoading) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
        <h1>Loading…</h1>
        <p>Checking SBT…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
      <h1>New Project</h1>
      <p style={{ opacity: 0.8 }}>
        ここは <b>SBTホルダー専用</b> の「プロジェクト作成」ページです。<br />
        “想い”が伝わる文章を中心に書けるようにしています。
      </p>

      <div style={{ marginTop: 10, opacity: 0.7 }}>
        Connected: <code>{address}</code> / balanceOf:{" "}
        <code>{read.data?.toString?.() ?? "n/a"}</code>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Core */}
      <div style={{ display: "grid", gap: 12 }}>
        <label>
          <div style={{ fontWeight: 700 }}>Title（プロジェクト名）</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：ADL_OO - Community Micro Projects"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 700 }}>Slug（URL用）</div>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="例：adl-oo-community"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc", fontFamily: "monospace" }}
          />
          <div style={{ marginTop: 6, opacity: 0.7 }}>
            公開URLイメージ：<code>/p/{slug || "your-slug"}</code>
          </div>
        </label>

        <label>
          <div style={{ fontWeight: 700 }}>Tagline（一言）</div>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="例：SBTの信用履歴で、プロジェクトを生む。"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 700 }}>Cover Image URL（任意）</div>
          <input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc", fontFamily: "monospace" }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 700 }}>Story / 想い（Markdown）</div>
          <textarea
            value={storyMd}
            onChange={(e) => setStoryMd(e.target.value)}
            rows={10}
            placeholder="なぜこれをやりたいのか。背景、痛み、願い、誰に届けたいか。"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 700 }}>Vision（Markdown）</div>
          <textarea
            value={visionMd}
            onChange={(e) => setVisionMd(e.target.value)}
            rows={8}
            placeholder="成功したら世界はどう変わるか。どんな文化/習慣が生まれるか。"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <details style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Advanced（後でUI化する領域）</summary>
          <div style={{ height: 10 }} />
          <label>
            <div style={{ fontWeight: 700 }}>plan_json（JSON）</div>
            <textarea
              value={planJsonText}
              onChange={(e) => setPlanJsonText(e.target.value)}
              rows={6}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc", fontFamily: "monospace" }}
            />
          </label>
          <div style={{ height: 10 }} />
          <label>
            <div style={{ fontWeight: 700 }}>token_json（JSON）</div>
            <textarea
              value={tokenJsonText}
              onChange={(e) => setTokenJsonText(e.target.value)}
              rows={6}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc", fontFamily: "monospace" }}
            />
          </label>
        </details>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <button onClick={saveDraft} disabled={saving} style={{ padding: "10px 14px", cursor: "pointer" }}>
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button onClick={submit} disabled={saving} style={{ padding: "10px 14px", cursor: "pointer" }}>
            {saving ? "Submitting…" : "Submit for Review"}
          </button>
          <button onClick={() => navigate("/jobs")} style={{ padding: "10px 14px", cursor: "pointer" }}>
            Back to Jobs
          </button>
        </div>

        {msg && (
          <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            {msg}
            {created?.slug && (
              <div style={{ marginTop: 8, opacity: 0.8 }}>
                Draft link（※公開は承認後）： <code>/p/{created.slug}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
