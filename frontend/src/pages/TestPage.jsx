import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import api from "../api/client"
import { useSoundToggle } from "../hooks/useSound"

function TestPage() {
  const { sessionId } = useParams()
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const sound = useSoundToggle()

  const completeSession = async () => {
    const finish = await api.post("/test/finish", { session_id: Number(sessionId) })
    navigate(`/test/result/${sessionId}`, { state: { result: finish.data } })
  }

  const loadQuestion = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await api.get("/test/question", {
        params: { session_id: Number(sessionId) },
      })
      if (response.data.finished) {
        await completeSession()
        return
      }
      setQuestion(response.data.question)
      setProgress(response.data.progress)
      setTotal(response.data.total)
    } catch (err) {
      setError(err?.response?.data?.detail || "Savolni yuklab bo'lmadi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestion()
  }, [sessionId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await api.post("/test/answer", {
        session_id: Number(sessionId),
        answer,
      })

      const current = response.data
      setFeedback({
        correct: current.correct,
        expected: current.expected,
      })

      if (current.correct) {
        sound.playSuccess()
      } else {
        sound.playFail()
      }

      if (current.finished) {
        await completeSession()
        return
      }

      const next = await api.post("/test/next", { session_id: Number(sessionId) })
      setQuestion(next.data.question)
      setProgress(next.data.progress)
      setTotal(next.data.total)
      setAnswer("")
    } catch (err) {
      setError(err?.response?.data?.detail || "Javob tekshirishda xatolik.")
    } finally {
      setSubmitting(false)
    }
  }

  const progressPercent = total > 0 ? Math.round((progress / total) * 100) : 0

  return (
    <section className="card stack">
      <div className="row between">
        <h2>Test</h2>
        <span className="chip">
          {progress}/{total}
        </span>
      </div>

      <div className="progress-wrap">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {loading ? <p className="muted">Savol yuklanmoqda...</p> : <h3 className="question">{question} - ?</h3>}

      <form className="stack" onSubmit={handleSubmit}>
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Javobni kiriting"
          required
          disabled={loading || submitting}
        />
        <button className="primary" type="submit" disabled={loading || submitting}>
          {submitting ? "Tekshirilmoqda..." : "Submit / Next"}
        </button>
      </form>

      {feedback && (
        <div className={feedback.correct ? "feedback success pop" : "feedback error shake"}>
          {feedback.correct ? "Correct" : `Wrong. To'g'ri javob: ${feedback.expected}`}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </section>
  )
}

export default TestPage
