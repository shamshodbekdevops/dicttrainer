import { useState } from "react"

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5C6.6 5 2.1 8.3 1 12c1.1 3.7 5.6 7 11 7s9.9-3.3 11-7c-1.1-3.7-5.6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.7 3.9 1.3 5.3l3.1 3.1C2.9 9.5 1.7 10.8 1 12c1.1 3.7 5.6 7 11 7 2.1 0 4.1-.5 5.8-1.3l3 3 1.4-1.4L2.7 3.9Zm9.3 12.1a4 4 0 0 1-4-4c0-.4.1-.7.2-1l4.8 4.8-.9.2Zm7.6-2.2c1.5-1.1 2.7-2.5 3.4-3.8-1.1-3.7-5.6-7-11-7-1.6 0-3.1.3-4.4.8l1.7 1.7c.9-.3 1.8-.5 2.7-.5a4 4 0 0 1 4 4c0 .9-.3 1.8-.8 2.5l3.1 3.1Z" />
    </svg>
  )
}

function PasswordField({ value, onChange, placeholder = "Password", ...rest }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        {...rest}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

export default PasswordField
