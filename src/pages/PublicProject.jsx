import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function PublicProject() {
  const { slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [err, setErr] = useState("")

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setErr("")
      try {
        const res = await fetch(`/api/public/project/${slug}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Failed")
        if (alive) setData(json)
      } catch (e) {
        if (alive) setErr(e.message)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [slug])

  if (loading) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Loading…</div>
  if (err) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>❌ {err}</div>
  if (!data) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Not found</div>

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
      <h1 style={{ marginBottom: 6 }}>{data.title}</h1>
      <div style={{ opacity: 0.8, fontSize: 16 }}>{data.tagline}</div>

      {data.cover_image_url && (
        <img
          src={data.cover_image_url}
          alt="cover"
          style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 16, marginTop: 16 }}
        />
      )}

      <hr style={{ margin: "20px 0" }} />

      <h2>Story</h2>
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{data.story_md}</pre>

      <h2>Vision</h2>
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{data.vision_md}</pre>

      <div style={{ marginTop: 24, opacity: 0.7 }}>
        status: <code>{data.status}</code>
      </div>
    </div>
  )
}
