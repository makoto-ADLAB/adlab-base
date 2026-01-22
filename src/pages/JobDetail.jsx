import { Link, useParams } from "react-router-dom"
import { getJobById } from "../data/jobs"

export default function JobDetail() {
  const { id } = useParams()
  const job = getJobById(id)

  if (!job) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
        <h1>Job not found</h1>
        <p style={{ opacity: 0.8 }}>The job ID does not exist (or was removed).</p>

        <div style={{ marginTop: 16 }}>
          <Link to="/jobs">← Back to Jobs</Link>
          <span style={{ margin: "0 10px" }} />
          <Link to="/">← Back to Gate</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
      <h1>{job.title}</h1>
      <p style={{ opacity: 0.8 }}>{job.meta}</p>

      <hr style={{ margin: "20px 0" }} />

      <p style={{ fontSize: 16, lineHeight: 1.7 }}>{job.description}</p>

      {job.bullets?.length ? (
        <ul style={{ paddingLeft: 18, lineHeight: 1.8, marginTop: 14 }}>
          {job.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}

      <div style={{ marginTop: 22 }}>
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            border: "1px solid #333",
            borderRadius: 10,
            textDecoration: "none",
            color: "#111",
          }}
        >
          {job.applyLabel || "Apply"}
        </a>

        <p style={{ marginTop: 10, opacity: 0.7 }}>
          ※ Apply is currently external (Google Form / Email / DM).
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link to="/jobs">← Back to Jobs</Link>
        <span style={{ margin: "0 10px" }} />
        <Link to="/">← Back to Gate</Link>
      </div>
    </div>
  )
}
