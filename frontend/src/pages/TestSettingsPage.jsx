import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import api from "../api/client"
import { useSoundToggle } from "../hooks/useSound"

function TestSettingsPage() {
  const [direction, setDirection] = useState("en_to_uz")
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const sound = useSoundToggle()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await api.get("/words", { params: { page: 1 } })
        const count = response.data.count || 0
        setTotalWords(count)
        if (count > 0) {
          setStart(0)
          setEnd(count - 1)
        }
      } catch (err) {
        setError(err?.response?.data?.detail || "So'zlar sonini olishda xatolik.")
      }
    }

    fetchCount()
  }, [])

  const validate = () => {
    if (totalWords === 0) {
      return "Test uchun so'zlar yo'q."
    }
    if (start < 0) {
      return "start >= 0 bo'lishi kerak."
    }
    if (end > totalWords - 1) {
      return `end <= ${totalWords - 1} bo'lishi kerak.`
    }
    if (start > end) {
      return "start <= end bo'lishi kerak."
    }
    return ""
  }

  const handleStart = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await api.post("/test/start", {
        direction,
        start,
        end,
      })
      navigate(`/test/${response.data.session_id}`)
    } catch (err) {
      setError(err?.response?.data?.detail || "Testni boshlashda xatolik.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card stack">
      <h2>Test Settings</h2>
      <p className="muted">Sizda {totalWords} ta so'z bor. Yaroqli range: 0-{Math.max(totalWords - 1, 0)}</p>

      <label>
        Direction
        <select value={direction} onChange={(e) => setDirection(e.target.value)}>
          <option value="en_to_uz">English -&gt; Uzbek</option>
          <option value="uz_to_en">Uzbek -&gt; English</option>
        </select>
      </label>

      <div className="grid two-col">
        <label>
          Start index
          <input type="number" min={0} value={start} onChange={(e) => setStart(Number(e.target.value))} />
        </label>
        <label>
          End index
          <input
            type="number"
            min={0}
            value={end}
            onChange={(e) => setEnd(Number(e.target.value))}
            max={Math.max(totalWords - 1, 0)}
          />
        </label>
      </div>

      <div className="row between">
        <button className="ghost" type="button" onClick={sound.toggle}>
          {sound.enabled ? "Sound ON" : "Sound OFF"}
        </button>
        <button className="primary" type="button" onClick={handleStart} disabled={loading || totalWords === 0}>
          {loading ? "Boshlanmoqda..." : "Start"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
    </section>
  )
}

export default TestSettingsPage
