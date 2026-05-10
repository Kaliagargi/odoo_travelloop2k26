"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Registration failed")
      setLoading(false)
      return
    }

    router.push("/login")
  }

  return (
    <div
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
      className="min-h-screen flex items-center justify-center bg-[#f0f4f8] px-4"
    >
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex min-h-[680px]">

        {/* ── LEFT PANEL ── */}
        <div
          className="flex-[1.1] relative flex flex-col justify-end p-12 overflow-hidden"
          style={{ background: "linear-gradient(160deg,#0077B6 0%,#023047 60%,#012030 100%)" }}
        >
          {/* Decorative circles */}
          <div className="absolute w-[420px] h-[420px] rounded-full border border-white/[0.06] -top-20 -left-24 pointer-events-none" />
          <div className="absolute w-[280px] h-[280px] rounded-full border border-white/[0.06] top-10 left-5 pointer-events-none" />
          <div className="absolute w-[600px] h-[600px] rounded-full border border-white/[0.04] -bottom-48 -right-48 pointer-events-none" />
          <div className="absolute w-[320px] h-[320px] rounded-full bg-[rgba(0,119,182,0.25)] -bottom-20 -left-14 pointer-events-none" />

          {/* Globe SVG */}
          <svg
            className="absolute top-20 right-10 opacity-[0.18] pointer-events-none"
            width="260" height="180" viewBox="0 0 260 180"
          >
            <ellipse cx="130" cy="90" rx="120" ry="80" fill="none" stroke="white" strokeWidth="1"/>
            <ellipse cx="130" cy="90" rx="120" ry="30" fill="none" stroke="white" strokeWidth="0.8"/>
            <ellipse cx="130" cy="90" rx="40" ry="80" fill="none" stroke="white" strokeWidth="0.8"/>
            <ellipse cx="130" cy="90" rx="90" ry="80" fill="none" stroke="white" strokeWidth="0.6"/>
            <line x1="10" y1="90" x2="250" y2="90" stroke="white" strokeWidth="0.7"/>
            <line x1="130" y1="10" x2="130" y2="170" stroke="white" strokeWidth="0.7"/>
          </svg>

          {/* Airplane SVG */}
          <svg
            className="absolute top-[52px] right-[100px] opacity-90 pointer-events-none"
            width="64" height="64" viewBox="0 0 64 64"
          >
            <path d="M8 40 Q20 18 48 22" fill="none" stroke="#FFB703" strokeWidth="1.5" strokeDasharray="4 3"/>
            <circle cx="8" cy="40" r="2.5" fill="#FFB703"/>
            <g transform="translate(46,20) rotate(-30)">
              <path d="M-14,0 Q-4,-4 14,-1 Q18,0 14,2 Q-4,4 -14,0Z" fill="white"/>
              <path d="M14,-1 Q22,0 14,2Z" fill="#ccc"/>
              <path d="M-2,-4 Q-4,-14 6,-11 Q8,-4 2,-4Z" fill="white"/>
              <path d="M-2,4 Q-4,14 6,11 Q8,4 2,4Z" fill="white"/>
              <path d="M-12,-4 Q-15,-9 -6,-7 Q-5,-2 -9,-4Z" fill="#FFB703"/>
              <path d="M-12,4 Q-15,9 -6,7 Q-5,2 -9,4Z" fill="#FFB703"/>
            </g>
          </svg>

          {/* Logo */}
          <div className="absolute top-10 left-12 flex items-center gap-2">
            <span className="text-[22px] font-bold text-white tracking-widest">
              TRAVE<span className="font-light">LOOP</span>
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFB703] ml-0.5" />
          </div>

          {/* Content — register-specific copy */}
          <div className="relative z-10">
            <p className="text-white/50 text-xs tracking-[4px] uppercase mb-4">Join the community</p>
            <h1 className="text-white text-[42px] font-bold leading-[1.15] mb-5">
              Your next adventure<br />starts here.
            </h1>
            <p className="text-white/55 text-[15px] leading-[1.7] mb-10 max-w-[320px]">
              Create a free account and start planning trips, tracking budgets, and exploring the world — your way.
            </p>

            {/* Steps */}
            <div className="flex flex-col gap-4">
              {[
                { step: "01", text: "Create your free account" },
                { step: "02", text: "Plan your first trip" },
                { step: "03", text: "Travel smarter, live fuller" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-[#FFB703]/60 flex items-center justify-center shrink-0">
                    <span className="text-[#FFB703] text-[11px] font-bold">{step}</span>
                  </div>
                  <p className="text-white/70 text-[14px] m-0">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-[0.9] bg-[#FAFAF8] flex flex-col justify-center px-12 py-14">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-11">
            <span className="text-[20px] font-bold text-[#023047] tracking-[0.5px]">
              TRAVE<span className="font-light text-[#0077B6]">LOOP</span>
            </span>
            <div className="w-[5px] h-[5px] rounded-full bg-[#FFB703]" />
          </div>

          <p className="text-[#888] text-xs tracking-[3px] uppercase mb-2">Get started</p>
          <h2 className="text-[#023047] text-[28px] font-bold mb-8">Create your account</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="block text-xs font-semibold text-[#023047] mb-1.5 tracking-[0.5px]">
                Full name
              </label>
              <input
                type="text"
                placeholder="Gargi"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-[1.5px] border-[#E0DDD5] rounded-[10px] text-sm text-[#023047] bg-white outline-none focus:border-[#0077B6] focus:ring-2 focus:ring-[#0077B6]/20 transition box-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023047] mb-1.5 tracking-[0.5px]">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-[1.5px] border-[#E0DDD5] rounded-[10px] text-sm text-[#023047] bg-white outline-none focus:border-[#0077B6] focus:ring-2 focus:ring-[#0077B6]/20 transition box-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#023047] mb-1.5 tracking-[0.5px]">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-[1.5px] border-[#E0DDD5] rounded-[10px] text-sm text-[#023047] bg-white outline-none focus:border-[#0077B6] focus:ring-2 focus:ring-[#0077B6]/20 transition box-border"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-[10px] px-4 py-3">
                <p className="text-red-500 text-xs m-0">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0077B6] text-white border-none rounded-[10px] text-[15px] font-semibold cursor-pointer tracking-[0.3px] hover:bg-[#005f8e] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E8E5DD]" />
            <span className="text-[#aaa] text-xs">or</span>
            <div className="flex-1 h-px bg-[#E8E5DD]" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-[11px] border border-[#E0DDD5] rounded-[10px] bg-white text-[13px] text-[#444] cursor-pointer hover:bg-gray-50 transition">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-[11px] border border-[#E0DDD5] rounded-[10px] bg-white text-[13px] text-[#444] cursor-pointer hover:bg-gray-50 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Login hint */}
          <div className="flex items-center gap-2 mt-6 px-4 py-3.5 bg-[#FFFBF0] rounded-[10px] border border-[#FFE5A0]">
            <div className="w-2 h-2 rounded-full bg-[#FFB703] shrink-0" />
            <p className="text-xs text-[#7A5C00] m-0">
              Already have an account?{" "}
              <Link href="/login" className="text-[#B8860B] font-semibold no-underline hover:underline">
                Sign in instead →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
