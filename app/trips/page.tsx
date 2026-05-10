"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Trip = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  isPublic: boolean
  stops: { activities: { estimatedCost: number }[] }[]
}

// ── Sidebar nav items ──
const navItems = [
  { label: "Dashboard",    href: "/dashboard", active: false, icon: "⊞" },
  { label: "My Trips",     href: "/trips",     active: true,  icon: "🗺" },
  { label: "Itinerary",    href: "/itinerary", active: false, icon: "📅" },
  { label: "Budget",       href: "/budget",    active: false, icon: "👛" },
  { label: "Packing List", href: "/packing",   active: false, icon: "✅" },
  { label: "Journal",      href: "/journal",   active: false, icon: "📝" },
]

// ── Gradient covers for trip cards (cycles through) ──
const cardGradients = [
  "linear-gradient(135deg,#0077B6,#023047)",
  "linear-gradient(135deg,#FFB703,#e07b00)",
  "linear-gradient(135deg,#0096C7,#0077B6)",
  "linear-gradient(135deg,#023047,#012030)",
  "linear-gradient(135deg,#2ecc71,#1a7a43)",
  "linear-gradient(135deg,#e07b00,#FFB703)",
]

const cardIcons = ["🏖", "🏢", "⛰", "🌊", "🌲", "❄️"]

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/trips")
      .then(r => r.json())
      .then(data => { setTrips(data); setLoading(false) })
  }, [])

  async function deleteTrip(id: string) {
    if (!confirm("Delete this trip?")) return
    await fetch(`/api/trips/${id}`, { method: "DELETE" })
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  const totalBudget = (trip: Trip) =>
    trip.stops.flatMap(s => s.activities).reduce((s, a) => s + a.estimatedCost, 0)

  return (
    <div
      style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "720px" }}
      className="flex bg-[#F7F6F2]"
    >

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] bg-[#023047] flex flex-col py-7 shrink-0">

        {/* Logo */}
        <div className="px-6 pb-8 flex items-center">
          <span className="text-[18px] font-bold text-white tracking-widest">
            TRAVE<span className="font-light">LOOP</span>
          </span>
          <div className="w-[5px] h-[5px] rounded-full bg-[#FFB703] inline-block ml-1" />
        </div>

        {/* Nav */}
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

        {/* User */}
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

        {/* Header row */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 border border-[#E0DDD5] rounded-[8px] bg-white text-[#555] text-[13px] no-underline hover:bg-gray-50 transition"
            >
              ← Back
            </Link>
            <div>
              <p className="text-[#888] text-[12px] tracking-[2px] uppercase m-0 mb-0.5">Your journeys</p>
              <h1 className="text-[#023047] text-[26px] font-bold m-0">My Trips</h1>
            </div>
          </div>
          <Link
            href="/trips/new"
            className="flex items-center gap-2 px-[22px] py-[11px] bg-[#0077B6] text-white no-underline rounded-[10px] text-[13px] font-semibold hover:bg-[#005f8e] transition"
          >
            + New Trip
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-[#0077B6]/20 border-t-[#0077B6] rounded-full animate-spin" />
              <p className="text-[#888] text-[13px]">Loading your trips...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-[32px] mb-5"
              style={{ background: "linear-gradient(135deg,#0077B6,#023047)" }}
            >
              🗺
            </div>
            <h2 className="text-[#023047] text-[20px] font-bold m-0 mb-2">No trips yet</h2>
            <p className="text-[#888] text-[14px] mb-7 m-0">Start planning your first adventure</p>
            <Link
              href="/trips/new"
              className="flex items-center gap-2 px-6 py-3 bg-[#0077B6] text-white no-underline rounded-[10px] text-[14px] font-semibold hover:bg-[#005f8e] transition"
            >
              + Plan your first trip
            </Link>
          </div>
        )}

        {/* Trips grid */}
        {!loading && trips.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {trips.map((trip, i) => {
              const budget = totalBudget(trip)
              const gradient = cardGradients[i % cardGradients.length]
              const icon = cardIcons[i % cardIcons.length]
              const start = new Date(trip.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
              const end   = new Date(trip.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-[14px] overflow-hidden border border-[#ECEAE3] hover:shadow-md transition"
                >
                  {/* Cover strip */}
                  <div
                    className="h-[72px] flex items-center px-5 gap-3 relative overflow-hidden"
                    style={{ background: gradient }}
                  >
                    <div className="absolute w-[120px] h-[120px] rounded-full border border-white/[0.08] -top-8 -right-8 pointer-events-none" />
                    <div className="text-[28px]">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[15px] font-bold m-0 truncate">{trip.title}</p>
                      <p className="text-white/60 text-[11px] m-0 mt-0.5">📅 {start} → {end}</p>
                    </div>
                    {trip.isPublic && (
                      <span className="shrink-0 text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold">
                        Public
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    {trip.description && (
                      <p className="text-[#888] text-[13px] leading-[1.6] m-0 mb-4 line-clamp-2">
                        {trip.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Budget */}
                      <div>
                        <p className="text-[#aaa] text-[11px] uppercase tracking-[1px] m-0">Est. Budget</p>
                        <p className="text-[#023047] text-[18px] font-bold m-0 mt-0.5">
                          ₹{budget.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/trips/${trip.id}/build`)}
                          className="text-[12px] border border-[#E0DDD5] px-3 py-1.5 rounded-[8px] text-[#555] bg-white hover:bg-[#F7F6F2] transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => router.push(`/trips/${trip.id}`)}
                          className="text-[12px] bg-[#0077B6] text-white px-3 py-1.5 rounded-[8px] hover:bg-[#005f8e] transition cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteTrip(trip.id)}
                          className="text-[12px] text-red-400 hover:text-red-600 px-2 transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
