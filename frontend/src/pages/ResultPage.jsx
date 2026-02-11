import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import api from "../api/client"

function ResultPage() {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [result, setResult] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(!location.state?.result)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      if (result) {
        return
      }
      setLoading(true)
      try {
        const response = await api.post("/test/finish", { session_id: Number(sessionId) })
        setResult(response.data)
      } catch (err) {
        setError(err?.response?.data?.detail || "Natijani yuklab bo'lmadi.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId, result])

  if (loading) {
    return (
      <section className="card">
        <p className="muted">Natija yuklanmoqda...</p>
      </section>
    )
  }

  if (error || !result) {
    return (
      <section className="card">
        <p className="error-text">{error || "Natija topilmadi."}</p>
      </section>
    )
  }

  return (
    <section className="stack-lg">
      <article className="card stack">
        <h2>Natija</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <p>To'g'ri</p>
            <strong>{result.correct}</strong>
          </div>
          <div className="stat-card">
            <p>Noto'g'ri</p>
            <strong>{result.wrong}</strong>
          </div>
          <div className="stat-card">
            <p>Foiz</p>
            <strong>{result.percentage}%</strong>
          </div>
        </div>

        <div className="row gap">
          <button className="primary" type="button" onClick={() => navigate("/test/settings")}>
            Yangi test
          </button>
          <button
            className="ghost"
            type="button"
            disabled={!result.mistakes?.length}
            onClick={() => navigate("/test/mistakes", { state: { mistakes: result.mistakes } })}
          >
            Repeat mistakes
          </button>
        </div>
      </article>

      <article className="card">
        <h3>Xato qilingan so'zlar</h3>
        {!result.mistakes?.length && <p className="success-text">Xato yo'q. Zo'r!</p>}
        <div className="stack">
          {result.mistakes?.map((item, index) => (
            <div className="mistake-item" key={`${item.prompt}-${index}`}>
              <p>
                <strong>{item.prompt}</strong>
              </p>
              <p>
                Sizniki: {item.provided || "-"} | To'g'risi: <strong>{item.expected}</strong>
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

export default ResultPage
