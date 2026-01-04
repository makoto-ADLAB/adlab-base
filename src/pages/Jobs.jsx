import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount, useReadContract } from "wagmi"
import { JOBS } from "../data/jobs.js"

// --- SBT gate ---
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

export default function Jobs() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()

  // --- SBT check ---
  const read = useReadContract({
    address: SBT_CONTRACT,
    abi: sbtAbi,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
  })
  const hasSbt = read.data ? BigInt(read.data) > 0n : false

  // ✅ protect route
  useEffect(() => {
    if (read.isLoading) return
    if (!isConnected) navigate("/", { replace: true })
    if (isConnected && !hasSbt) navigate("/", { replace: true })
  }, [isConnected, hasSbt, read.isLoading, navigate])

  // --- UI state ---
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("All")

  const categories = useMemo(() => {
    const set = new Set(JOBS.map((j) => j.category))
    return ["All", ...Array.from(set)]
  }, [])
/*   Filter 無しの場合
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return JOBS.filter((j) => {
      const okCat = cat === "All" ? true : j.category === cat
      const hay = `${j.title} ${j.description} ${j.tags?.join(" ")}`.toLowerCase()
      const okQ = query ? hay.includes(query) : true
      return okCat && okQ
    })
  }, [q, cat])
*/
const filtered = useMemo(() => {
  const query = q.trim().toLowerCase()
  return JOBS
    .filter((j) => j.status === "open")
    .filter((j) => {
      const okCat = cat === "All" ? true : j.category === cat
      const hay = `${j.title} ${j.description} ${j.tags?.join(" ")}`.toLowerCase()
      const okQ = query ? hay.includes(query) : true
      return okCat && okQ
    })
}, [q, cat])



  if (!isConnected || read.isLoading) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
        <h1>Loading…</h1>
        <p>Checking your SBT…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
      <h1>Jobs (SBT holders)</h1>
      <p style={{ opacity: 0.85 }}>
        このページは <b>SBT必須</b> です。応募ページ（/apply）はSBT不要です。
      </p>

      <div style={{ marginTop: 10, opacity: 0.7 }}>
        Connected: <code>{address}</code> / balanceOf:{" "}
        <code>{read.data?.toString?.() ?? "n/a"}</code>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search jobs…"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            minWidth: 260,
            flex: "1 1 260px",
          }}
        />

        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Back to Gate
        </button>
      </div>

      {/* Jobs list */}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map((job) => (
          <div
            key={job.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: 14,
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{job.title}</div>
                <div style={{ opacity: 0.75, marginTop: 4 }}>
                  {job.category} • {job.location} • {job.reward}
                </div>
              </div>

              {/* ✅ 応募は /apply/:jobId に遷移（SBT不要ページ） */}
              <button
                onClick={() => navigate(`/apply/${job.id}`)}
                style={{ padding: "10px 14px", cursor: "pointer" }}
              >
                Apply
              </button>
            </div>

            <p style={{ marginTop: 10, marginBottom: 8, opacity: 0.9 }}>
              {job.description}
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {job.tags?.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 12,
                    border: "1px solid #eee",
                    padding: "4px 8px",
                    borderRadius: 999,
                    opacity: 0.85,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div style={{ opacity: 0.75 }}>No jobs found.</div>}
      </div>
    </div>
  )
}
