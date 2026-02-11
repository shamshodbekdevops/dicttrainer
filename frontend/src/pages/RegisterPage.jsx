import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import PasswordField from "../components/PasswordField"
import { useAuth } from "../context/AuthContext"
import { extractApiError } from "../utils/apiError"

function RegisterPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      await register({ email, username, password })
      navigate("/dashboard")
    } catch (err) {
      setError(extractApiError(err, "Register failed."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card auth-card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="stack">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          minLength={8}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Yuklanmoqda..." : "Ro'yxatdan o'tish"}
        </button>
      </form>
      <p>
        Akkauntingiz bormi? <Link to="/login">Login</Link>
      </p>
    </section>
  )
}

export default RegisterPage
