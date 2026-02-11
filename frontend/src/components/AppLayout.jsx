import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => navigate('/')}>DictTrainer</button>
      <nav className="nav-links">
        {!isAuthenticated && (
          <>
            <button className="ghost" type="button" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="primary" type="button" onClick={() => navigate('/register')}>
              Register
            </button>
          </>
        )}
        {isAuthenticated && (
          <>
            <button className="ghost" type="button" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <span className="chip">{user?.username}</span>
            <button className="danger" type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

function AppLayout({ children }) {
  return (
    <div className="app-bg">
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="binary-overlay" aria-hidden="true">
        010101 110010 010111 101001 011010 110101 001110 010101 111000 010101
      </div>
      <Navbar />
      <div className="terminal-strip">
        <span>$ dicttrainer run --mode=practice</span>
      </div>
      <main className="container">{children}</main>
    </div>
  )
}

export default AppLayout
