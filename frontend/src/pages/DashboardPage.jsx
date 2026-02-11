import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import api from "../api/client"

function DashboardPage() {
  const PAGE_SIZE = 5

  const [english, setEnglish] = useState("")
  const [uzbek, setUzbek] = useState("")
  const [search, setSearch] = useState("")
  const [allWords, setAllWords] = useState([])
  const [words, setWords] = useState([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState(null)

  const navigate = useNavigate()

  const totalPages = useMemo(() => {
    if (count === 0) {
      return 1
    }
    return Math.ceil(count / PAGE_SIZE)
  }, [count])

  const loadWords = async () => {
    setLoading(true)
    setError("")

    try {
      let collected = []
      let currentPage = 1
      let totalCount = null

      while (true) {
        const response = await api.get("/words", {
          params: {
            page: currentPage,
          },
        })

        const payload = response.data

        if (Array.isArray(payload)) {
          collected = payload
          break
        }

        const pageItems = payload.results || []
        totalCount = payload.count ?? pageItems.length
        collected.push(...pageItems)

        if (collected.length >= totalCount || pageItems.length === 0) {
          break
        }

        currentPage += 1
      }

      setAllWords(collected)
    } catch (err) {
      setError(err?.response?.data?.detail || "Lug'atlarni yuklashda xatolik.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWords()
  }, [])

  useEffect(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? allWords.filter(
          (word) =>
            word.english.toLowerCase().includes(query) || word.uzbek.toLowerCase().includes(query),
        )
      : allWords

    const newCount = filtered.length
    const maxPage = Math.max(1, Math.ceil(newCount / PAGE_SIZE))
    const safePage = Math.min(page, maxPage)

    if (safePage !== page) {
      setPage(safePage)
      return
    }

    const start = (safePage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE

    setCount(newCount)
    setWords(filtered.slice(start, end))
  }, [allWords, search, page])

  const resetForm = () => {
    setEnglish("")
    setUzbek("")
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      if (editingId) {
        await api.patch(`/words/${editingId}`, { english, uzbek })
      } else {
        await api.post("/words", { english, uzbek })
      }
      resetForm()
      await loadWords()
    } catch (err) {
      setError(err?.response?.data?.detail || "Saqlashda xatolik.")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (word) => {
    setEditingId(word.id)
    setEnglish(word.english)
    setUzbek(word.uzbek)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Bu so'zni o'chirasizmi?")) {
      return
    }

    try {
      await api.delete(`/words/${id}`)
      await loadWords()
    } catch (err) {
      setError(err?.response?.data?.detail || "O'chirishda xatolik.")
    }
  }

  const startItem = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = count === 0 ? 0 : Math.min(page * PAGE_SIZE, count)
  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return (
    <section className="stack-lg">
      <div className="card">
        <div className="row between">
          <h2>Dashboard</h2>
          <button className="primary" type="button" onClick={() => navigate("/test/settings")}>
            Start Test
          </button>
        </div>
        <p className="muted">Sizning jami so'zlaringiz: {count}</p>
      </div>

      <div className="grid two-col">
        <article className="card">
          <h3>{editingId ? "So'zni tahrirlash" : "Yangi so'z qo'shish"}</h3>
          <form onSubmit={handleSubmit} className="stack">
            <input
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="English word"
              required
            />
            <input value={uzbek} onChange={(e) => setUzbek(e.target.value)} placeholder="Uzbek translation" required />
            <div className="row gap">
              <button className="primary" type="submit" disabled={saving}>
                {saving ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Qo'shish"}
              </button>
              {editingId && (
                <button className="ghost" type="button" onClick={resetForm}>
                  Bekor qilish
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="card">
          <h3>Qidirish</h3>
          <input
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            placeholder="Masalan: app"
          />
          {loading && <p className="muted">Yuklanmoqda...</p>}
          {!loading && words.length === 0 && <p className="muted">So'z topilmadi.</p>}
          {error && <p className="error-text">{error}</p>}
          <div className="word-list">
            {words.map((word, index) => (
              <div className="word-item" key={word.id}>
                <div>
                  <div className="word-title">
                    <span className="word-index">#{(page - 1) * PAGE_SIZE + index + 1}</span>
                    <strong>{word.english}</strong>
                  </div>
                  <p>{word.uzbek}</p>
                </div>
                <div className="row gap">
                  <button className="ghost" type="button" onClick={() => handleEdit(word)}>
                    Edit
                  </button>
                  <button className="danger" type="button" onClick={() => handleDelete(word.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="row between">
            <button className="ghost" type="button" disabled={!hasPrevious} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <span className="chip">
              {startItem}-{endItem} / {count}
            </span>
            <button className="ghost" type="button" disabled={!hasNext} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}

export default DashboardPage
