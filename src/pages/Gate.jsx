import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi"

const SBT_CONTRACT = "0x7Db34db211f767484c8Ca9AC3Ef801C74D813488"

// ✅ 会社が案件を出すためのフォーム（SBT不要）
const COMPANY_FORM_URL = "https://forms.gle/REPLACE_WITH_COMPANY_FORM"

const sbtAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
]

function isLikelyAddress(v) {
  return /^0x[a-fA-F0-9]{40}$/.test(v)
}

export default function Gate() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  // ---- Lookup用（アドレス入力） ----
  const [lookup, setLookup] = useState("")
  const lookupAddress = useMemo(() => {
    const v = lookup.trim()
    return isLikelyAddress(v) ? v : null
  }, [lookup])

  // 接続中ウォレットのSBT保有チェック
  const connectedRead = useReadContract({
    address: SBT_CONTRACT,
    abi: sbtAbi,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
  })
  const connectedHasSBT = connectedRead.data ? BigInt(connectedRead.data) > 0n : false

  // 入力アドレスのSBT保有チェック（Lookup）
  const lookupRead = useReadContract({
    address: SBT_CONTRACT,
    abi: sbtAbi,
    functionName: "balanceOf",
    args: [lookupAddress],
    query: { enabled: !!lookupAddress },
  })
  const lookupHasSBT = lookupRead.data ? BigInt(lookupRead.data) > 0n : false

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 980 }}>
      <h1>ADLAB BASE</h1>
      <p style={{ opacity: 0.8 }}>
        Members (SBT holders) can access Jobs. Companies can submit requests without SBT.
      </p>

      <hr style={{ margin: "20px 0" }} />

      

      <div style={{ height: 16 }} />

      {/* A) 本人ログイン（Connect） */}
      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>A) Connect（本人として入場する）</h2>

        {!isConnected ? (
          <>
            <p style={{ opacity: 0.8 }}>ウォレット接続は本人確認です（なりすまし防止）。</p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {connectors.map((c) => (
                <button
                  key={c.uid}
                  onClick={() => connect({ connector: c })}
                  style={{ padding: "10px 14px", cursor: "pointer" }}
                >
                  Connect: {c.name}
                </button>
              ))}
            </div>

            <p style={{ marginTop: 12, opacity: 0.7 }}>
              Status: {status}
              {error ? ` | ${error.message}` : ""}
            </p>

            <p style={{ marginTop: 10, opacity: 0.7 }}>
              ※ 接続はガス代ゼロです（署名・送金なし）。
            </p>
          </>
        ) : (
          <>
            <p>
              Connected address: <code>{address}</code>
            </p>

            <button
              onClick={() => disconnect()}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              Disconnect
            </button>

            <div style={{ marginTop: 16 }}>
              <h3>Connected wallet SBT check</h3>

              {connectedRead.isLoading ? (
                <p>Checking…</p>
              ) : connectedRead.isError ? (
                <p>⚠️ Could not read contract (network / address)</p>
              ) : connectedHasSBT ? (
                <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
                  <p style={{ margin: 0 }}>✅ SBT verified — you can enter as this wallet.</p>

                  <button
                    onClick={() => navigate("/jobs")}
                    style={{ padding: "10px 14px", cursor: "pointer", marginTop: 10 }}
                  >
                    Enter ADLAB BASE (Jobs)
                  </button>
                </div>
              ) : (
                <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
                  ⛔ No SBT for this wallet.
                </div>
              )}

              <p style={{ marginTop: 8, opacity: 0.7 }}>
                Debug balanceOf: <code>{connectedRead.data?.toString?.() ?? "n/a"}</code>
              </p>
            </div>
          </>
        )}
      </section>

      <div style={{ height: 16 }} />
      
      { /*B) アドレス入力で確認（Lookup）*/ }
       <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>B) Address Lookup（入力で保有確認する）</h2>
        <p style={{ opacity: 0.8 }}>
          これは「確認」用です。入力したアドレスが本人である証明にはなりません（入場はできません）。
        </p>

        <input
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          placeholder="0x... (40 hex characters)"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontFamily: "monospace",
            fontSize: 14,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />

        {!lookup.trim() ? (
          <p style={{ marginTop: 10, opacity: 0.7 }}>アドレスを入力してください。</p>
        ) : !lookupAddress ? (
          <p style={{ marginTop: 10 }}>⚠️ アドレス形式が正しくありません。</p>
        ) : lookupRead.isLoading ? (
          <p style={{ marginTop: 10 }}>Checking…</p>
        ) : lookupRead.isError ? (
          <p style={{ marginTop: 10 }}>⚠️ 読み取り失敗（ネットワーク/コントラクト）</p>
        ) : lookupHasSBT ? (
          <div style={{ marginTop: 10, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
            ✅ This address holds ADLAB SBT.
          </div>
        ) : (
          <div style={{ marginTop: 10, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
            ⛔ This address does NOT hold ADLAB SBT.
          </div>
        )}

        <p style={{ marginTop: 8, opacity: 0.7 }}>
          Debug balanceOf: <code>{lookupRead.data?.toString?.() ?? "n/a"}</code>
        </p>
      </section>
      
      {/* ✅ C) 会社向け（SBT不要） */}
      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>C) For Companies（SBT不要）</h2>
        <p style={{ opacity: 0.85 }}>
          会社・発注者の方は、ここから案件の依頼／募集リクエストを送れます（SBT不要）。
          送信内容を確認後、ADLAB側で審査してJobsに掲載します。
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href={COMPANY_FORM_URL} target="_blank" rel="noreferrer">
            <button style={{ padding: "10px 14px", cursor: "pointer" }}>
              Submit a Job Request (Google Form)
            </button>
          </a>

          <button
            onClick={() => window.location.href = "mailto:hello@REPLACE_WITH_EMAIL?subject=ADLAB%20Company%20Job%20Request"}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            Email (optional)
          </button>
        </div>

        <p style={{ marginTop: 10, opacity: 0.75 }}>
          ※ 会社は Jobs一覧（/jobs）は見えません（SBT保持者のみ）。
        </p>
      </section>
    </div>
  )
}
