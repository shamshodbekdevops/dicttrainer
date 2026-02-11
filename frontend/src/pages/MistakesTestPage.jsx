import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useSoundToggle } from "../hooks/useSound"

function normalize(value) {
  return value.trim().toLowerCase()
}

function MistakesTestPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const sound = useSoundToggle()

  const questions = useMemo(() => state?.mistakes || [], [state])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [done, setDone] = useState(false)

  if (!questions.length) {
    return (
      <section className="card stack">
        <h2>Repeat mistakes</h2>
        <p className="muted">Takrorlash uchun xatolar topilmadi.</p>
        <button className="primary" type="button" onClick={() => navigate("/dashboard")}>
          Dashboardga qaytish
        </button>
      </section>
    )
  }

  const current = questions[index]

  const submit = (event) => {
    event.preventDefault()
    const ok = normalize(answer) === normalize(current.expected)
    if (ok) {
      setCorrectCount((v) => v + 1)
      setFeedback("Correct")
      sound.playSuccess()
    } else {
      setWrongCount((v) => v + 1)
      setFeedback(`Wrong. To'g'ri javob: ${current.expected}`)
      sound.playFail()
    }

    if (index + 1 >= questions.length) {
      setDone(true)
      return
    }

    setIndex((v) => v + 1)
    setAnswer("")
  }

  if (done) {
    const percent = Math.round((correctCount / questions.length) * 100)
    return (
      <section className="card stack">
        <h2>Repeat mistakes: yakun</h2>
        <p>To'g'ri: {correctCount}</p>
        <p>Noto'g'ri: {wrongCount}</p>
        <p>Foiz: {percent}%</p>
        <button className="primary" type="button" onClick={() => navigate("/test/settings")}>
          Yangi test
        </button>
      </section>
    )
  }

  return (
    <section className="card stack">
      <div className="row between">
        <h2>Repeat mistakes</h2>
        <span className="chip">
          {index + 1}/{questions.length}
        </span>
      </div>
      <h3 className="question">{current.prompt} - ?</h3>
      <form onSubmit={submit} className="stack">
        <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Javob" required />
        <button className="primary" type="submit">
          Submit
        </button>
      </form>
      {feedback && <div className="feedback">{feedback}</div>}
    </section>
  )
}

export default MistakesTestPage
