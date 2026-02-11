import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import PasswordField from "../components/PasswordField"
import { useAuth } from "../context/AuthContext"
import { extractApiError } from "../utils/apiError"

function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login({ identifier, password })
      const fallback = "/dashboard"
      const target = location.state?.from || fallback
      navigate(target)
    } catch (err) {
      setError(extractApiError(err, "Login failed."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card auth-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="stack">
        <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email yoki Username" required />
        <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        {error && <p className="error-text">{error}</p>}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Yuklanmoqda..." : "Kirish"}
        </button>
      </form>
      <p>
        <Link to="/forgot-password">Parolni unutdingizmi?</Link>
      </p>
      <p>
        Akkaunt yo'qmi? <Link to="/register">Register</Link>
      </p>
    </section>
  )
}

export default LoginPage
