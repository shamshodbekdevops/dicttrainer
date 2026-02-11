import { useState } from "react"

import api from "../api/client"

function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await api.post("/auth/forgot-password", { email })
      setMessage(response.data.detail || "Reset link yuborildi.")
    } catch (err) {
      setError(err?.response?.data?.detail || "Xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card auth-card">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="stack">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Yuborilmoqda..." : "Reset link yuborish"}
        </button>
      </form>
    </section>
  )
}

export default ForgotPasswordPage
