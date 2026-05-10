"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

// ── Sidebar nav items ──
const navItems = [
  { label: "Dashboard",    href: "/dashboard", active: false, icon: "⊞" },
  { label: "My Trips",     href: "/trips",     active: true,  icon: "🗺" },
  { label: "Itinerary",    href: "/itinerary", active: false, icon: "📅" },
  { label: "Budget",       href: "/budget",    active: false, icon: "👛" },
  { label: "Packing List", href: "/packing",   active: false, icon: "✅" },
  { label: "Journal",      href: "/journal",   active: false, icon: "📝" },
]

const vibeOptions = ["Beach", "Adventure", "Heritage", "Nature", "Food", "Roadtrip", "Weekend"]

const coverGradients = [
  "linear-gradient(135deg,#0077B6,#023047)",
  "linear-gradient(135deg,#FFB703,#e07b00)",
  "linear-gradient(135deg,#2ecc71,#1a7a43)",
]

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [travelers, setTravelers] = useState(2)
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["Beach"])
  const [selectedCover, setSelectedCover] = useState(1)

  function toggleVibe(vibe: string) {
    setSelectedVibes(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:       form.get("title"),
        description: form.get("description"),
        startDate:   form.get("startDate"),
        endDate:     form.get("endDate"),
        travelers,
        budget:      form.get("budget"),
        tripType:    form.get("tripType"),
        vibes:       selectedVibes,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push(`/trips/${data.id}/build`)
  }

  async function handleSaveDraft(e: React.MouseEvent) {
    e.preventDefault()
    const form = (e.currentTarget.closest("form")) as HTMLFormElement
    if (!form) return
    setLoading(true)
    setError("")
    const fd = new FormData(form)
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:       fd.get("title") || "Untitled Trip",
        description: fd.get("description"),
        startDate:   fd.get("startDate"),
        endDate:     fd.get("endDate"),
        travelers,
        budget:      fd.get("budget"),
        tripType:    fd.get("tripType"),
        vibes:       selectedVibes,
        isDraft:     true,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push("/trips")
  }

  // Shared input class
  const inputCls = "w-full px-3.5 py-[11px] border-[1.5px] border-[#E0DDD5] rounded-[10px] text-[13px] text-[#023047] bg-[#FAFAF8] outline-none focus:border-[#0077B6] focus:ring-2 focus:ring-[#0077B6]/20 transition box-border"

  return (
    <div
      style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "720px" }}
      className="flex bg-[#F7F6F2]"
    >

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] bg-[#023047] flex flex-col py-7 shrink-0">
        <div className="px-6 pb-8 flex items-center">
          <span className="text-[18px] font-bold text-white tracking-widest">
            TRAVE<span className="font-light">LOOP</span>
          </span>
          <div className="w-[5px] h-[5px] rounded-full bg-[#FFB703] inline-block ml-1" />
        </div>
        <nav className="flex-1 flex flex-col gap-0.5">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-[13px] no-underline transition-colors
                ${item.active
                  ? "bg-white/[0.08] border-l-[3px] border-[#FFB703] text-white font-semibold"
                  : "text-white/45 hover:text-white/70 border-l-[3px] border-transparent"
                }`}
            >
              <span className="text-[17px] leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 pt-5 border-t border-white/[0.08] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0077B6] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
            AV
          </div>
          <div>
            <p className="text-white text-[12px] font-semibold m-0">Avishika</p>
            <p className="text-white/40 text-[11px] m-0">Explorer</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <Link
            href="/trips"
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E0DDD5] rounded-[8px] bg-white text-[#555] text-[13px] no-underline hover:bg-gray-50 transition"
          >
            ← Back
          </Link>
          <div>
            <p className="text-[#888] text-[12px] tracking-[2px] uppercase m-0 mb-0.5">New Journey</p>
            <h1 className="text-[#023047] text-[26px] font-bold m-0">Create a Trip</h1>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 rounded-[10px] px-4 py-3">
            <p className="text-red-500 text-xs m-0">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6" style={{ gridTemplateColumns: "1.3fr 1fr" }}>

            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col gap-[18px]">

              {/* Trip Details card */}
              <div className="bg-white rounded-[14px] p-6 border border-[#ECEAE3]">
                <h2 className="text-[#023047] text-[14px] font-bold m-0 mb-[18px] flex items-center gap-2">
                  <span className="text-[#0077B6]">ℹ</span> Trip Details
                </h2>

                {/* Trip name */}
                <div className="mb-4">
                  <label className="block text-[12px] font-semibold text-[#023047] mb-1.5 tracking-[0.3px]">
                    Trip Name <span className="text-[#0077B6]">*</span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g. Goa Summer Escape"
                    required
                    className={inputCls}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#023047] mb-1.5 tracking-[0.3px]">
                      Start Date <span className="text-[#0077B6]">*</span>
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#023047] mb-1.5 tracking-[0.3px]">
                      End Date <span className="text-[#0077B6]">*</span>
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      required
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Travelers counter */}
                <div className="mb-4">
                  <label className="block text-[12px] font-semibold text-[#023047] mb-1.5 tracking-[0.3px]">
                    Number of Travelers
                  </label>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTravelers(t => Math.max(1, t - 1))}
                      className="w-9 h-9 border-[1.5px] border-[#E0DDD5] rounded-[8px] bg-white text-[18px] cursor-pointer text-[#023047] flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      −
                    </button>
                    <span className="text-[16px] font-bold text-[#023047] min-w-6 text-center">
                      {travelers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTravelers(t => t + 1)}
                      className="w-9 h-9 border-[1.5px] border-[#0077B6] rounded-[8px] bg-[#E6F1FB] text-[18px] cursor-pointer text-[#0077B6] flex items-center justify-center hover:bg-[#d0e8f7] transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#023047] mb-1.5 tracking-[0.3px]">
                    Trip Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="What's the vibe? Beach holiday, heritage tour, adventure trek..."
                    className={`${inputCls} resize-none leading-[1.6]`}
                    style={{ height: "90px" }}
                  />
                </div>
              </div>

              {/* Budget Planning card */}
              <div className="bg-white rounded-[14px] p-6 border border-[#ECEAE3]">
                <h2 className="text-[#023047] text-[14px] font-bold m-0 mb-[18px] flex items-center gap-2">
                  <span className="text-[#FFB703]">👛</span> Budget Planning
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#023047] mb-1.5">
                      Total Budget (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-[13px]">₹</span>
                      <input
                        name="budget"
                        type="number"
                        placeholder="30000"
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#023047] mb-1.5">
                      Trip Type
                    </label>
                    <select
                      name="tripType"
                      className={inputCls}
                    >
                      <option value="budget">Budget</option>
                      <option value="comfort">Comfort</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-[18px]">

              {/* Cover Photo card */}
              <div className="bg-white rounded-[14px] p-6 border border-[#ECEAE3]">
                <h2 className="text-[#023047] text-[14px] font-bold m-0 mb-[18px] flex items-center gap-2">
                  <span className="text-[#0077B6]">🖼</span> Cover Photo
                </h2>
                <div className="border-2 border-dashed border-[#C8D8E8] rounded-[12px] py-8 px-5 text-center bg-[#F0F6FB] cursor-pointer hover:bg-[#e8f1f9] transition">
                  <div className="text-[28px] text-[#0077B6]">⬆</div>
                  <p className="text-[#0077B6] text-[13px] font-semibold mt-2.5 mb-1 m-0">Click to upload</p>
                  <p className="text-[#aaa] text-[11px] m-0">PNG, JPG up to 5MB</p>
                </div>
                <p className="text-[#aaa] text-[11px] mt-3 mb-3 text-center">
                  Or choose from our destinations gallery
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {coverGradients.map((grad, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCover(idx)}
                      className="h-[52px] rounded-[8px] cursor-pointer transition-all"
                      style={{
                        background: grad,
                        border: selectedCover === idx ? "2px solid #0077B6" : "2px solid transparent",
                        outline: selectedCover === idx ? "2px solid #0077B6" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Trip Vibe card */}
              <div className="bg-white rounded-[14px] p-6 border border-[#ECEAE3]">
                <h2 className="text-[#023047] text-[14px] font-bold m-0 mb-4 flex items-center gap-2">
                  <span className="text-[#0077B6]">🏷</span> Trip Vibe
                </h2>
                <div className="flex flex-wrap gap-2">
                  {vibeOptions.map(vibe => {
                    const active = selectedVibes.includes(vibe)
                    return (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => toggleVibe(vibe)}
                        className="px-3.5 py-1.5 rounded-[20px] text-[12px] cursor-pointer transition-all"
                        style={{
                          border: active ? "1.5px solid #0077B6" : "1.5px solid #E0DDD5",
                          background: active ? "#E6F1FB" : "white",
                          color: active ? "#0077B6" : "#555",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {vibe}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* CTA card */}
              <div className="bg-[#023047] rounded-[14px] p-6 relative overflow-hidden">
                <div className="absolute w-[150px] h-[150px] rounded-full border border-white/[0.06] -top-12 -right-12 pointer-events-none" />
                <p className="text-white/50 text-[11px] tracking-[2px] uppercase m-0 mb-1.5 relative">Ready?</p>
                <p className="text-white text-[16px] font-bold m-0 mb-5 relative">
                  Let's build your itinerary next
                </p>
                <div className="flex gap-2.5 relative">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="flex-1 py-3 bg-white text-[#023047] border-none rounded-[10px] text-[13px] font-bold cursor-pointer hover:bg-gray-100 transition disabled:opacity-60"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-[#FFB703] text-[#023047] border-none rounded-[10px] text-[13px] font-bold cursor-pointer hover:bg-[#e6a800] transition disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save & Continue →"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
