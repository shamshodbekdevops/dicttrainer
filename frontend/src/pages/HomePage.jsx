import { Link } from "react-router-dom"

function HomePage() {
  return (
    <section className="hero">
      <p className="eyebrow">Vocabulary Learning Platform</p>
      <h1>English-Uzbek so'zlarni kiriting, test ishlang va natijani kuzating.</h1>
      <p className="hero-sub">
        Foydalanuvchi o'z lug'atini qo'shadi, qidiradi, tahrirlaydi va o'chiradi. Tizim shu so'zlardan random savollar
        beradi, to'g'ri yoki xato javobni tekshiradi va yakuniy statistika bilan xato so'zlarni ko'rsatadi.
      </p>
      <div className="hero-actions">
        <Link to="/register" className="primary">
          Boshlash
        </Link>
        <Link to="/login" className="ghost">
          Login
        </Link>
      </div>
    </section>
  )
}

export default HomePage
