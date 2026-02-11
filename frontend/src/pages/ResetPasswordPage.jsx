import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import api from "../api/client"
import PasswordField from "../components/PasswordField"
import { extractApiError } from "../utils/apiError"

function ResetPasswordPage() {
  const [params] = useSearchParams()
  const uid = useMemo(() => params.get("uid") || "", [params])
  const token = useMemo(() => params.get("token") || "", [params])

  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await api.post("/auth/reset-password-confirm", {
        uid,
        token,
        new_password: password,
      })
      setMessage(response.data.detail || "Password updated.")
      setPassword("")
    } catch (err) {
      setError(extractApiError(err, "Reset failed."))
    } finally {
      setLoading(false)
    }
  }

  if (!uid || !token) {
    return (
      <section className="card auth-card">
        <h2>Reset Password</h2>
        <p className="error-text">Reset token topilmadi.</p>
      </section>
    )
  }

  return (
    <section className="card auth-card">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className="stack">
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          placeholder="Yangi password"
          required
        />
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "Saqlanmoqda..." : "Parolni yangilash"}
        </button>
      </form>
    </section>
  )
}

export default ResetPasswordPage
