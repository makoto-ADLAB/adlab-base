import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { JOBS } from "../data/jobs.js"

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text)
}

export default function Apply() {
  const navigate = useNavigate()
  const { jobId } = useParams()

  const job = useMemo(() => JOBS.find((j) => j.id === jobId), [jobId])

  if (!job) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
        <h1>Apply</h1>
        <p>
          Job not found: <code>{jobId}</code>
        </p>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Back
        </button>
      </div>
    )
  }

  const apply = job.apply

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
      <h1>Apply</h1>
      <p style={{ opacity: 0.85 }}>
        このページは <b>SBT不要</b> です。応募のための公開ページです。
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h2 style={{ marginTop: 0 }}>{job.title}</h2>
      <div style={{ opacity: 0.75 }}>
        {job.category} • {job.location} • {job.reward}
      </div>
      <p style={{ marginTop: 12 }}>{job.description}</p>

      <div style={{ marginTop: 16 }}>
        {apply?.type === "google_form" && (
          <a href={apply.url} target="_blank" rel="noreferrer">
            <button style={{ padding: "10px 14px", cursor: "pointer" }}>
              {apply.label ?? "Apply via Google Form"}
            </button>
          </a>
        )}

        {apply?.type === "dm" && (
          <a href={apply.url} target="_blank" rel="noreferrer">
            <button style={{ padding: "10px 14px", cursor: "pointer" }}>
              {apply.label ?? "Apply via DM"}
            </button>
          </a>
        )}

        {apply?.type === "usdc" && (
          <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
            <p style={{ marginTop: 0 }}>
              USDC応募（簡易版）：下記へ送金し、Tx hashをフォーム/DMで送ってください。
            </p>

            <div>
              <b>Chain:</b> {apply.chain}
            </div>
            <div>
              <b>Token:</b> {apply.token}
            </div>
            <div>
              <b>Amount:</b> {apply.amount}
            </div>

            <div style={{ marginTop: 8 }}>
              <b>Pay to:</b>{" "}
              <code style={{ wordBreak: "break-all" }}>{apply.payToAddress}</code>
              <button
                onClick={() => copyToClipboard(apply.payToAddress)}
                style={{ marginLeft: 8, cursor: "pointer" }}
              >
                Copy
              </button>
            </div>

            <div style={{ marginTop: 8 }}>
              <b>Memo:</b> <code>{apply.memo}</code>
              <button
                onClick={() => copyToClipboard(apply.memo)}
                style={{ marginLeft: 8, cursor: "pointer" }}
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Back to Gate
        </button>

        <button
          onClick={() => navigate("/jobs")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Go to Jobs (SBT required)
        </button>
      </div>
    </div>
  )
}
