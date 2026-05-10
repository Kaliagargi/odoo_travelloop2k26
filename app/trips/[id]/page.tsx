"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

type Activity = { id: string; name: string; category: string; estimatedCost: number; durationMinutes?: string }
type Stop     = { id: string; cityName: string; country: string; imageUrl?: string; activities: Activity[] }
type Trip     = { id: string; title: string; description: string; startDate: string; endDate: string; isPublic: boolean; publicSlug: string; stops: Stop[] }

const COLORS       = ["#0077B6","#FFB703","#10B981","#EF4444","#8B5CF6","#F97316"]
const STOP_ACCENTS = ["#0077B6","#FFB703","#023047"]
const STOP_BG      = ["#E6F1FB","#FAEEDA","#F1EFE8"]

const NAV_ITEMS = [
  { icon: "ti-home",      label: "Dashboard" },
  { icon: "ti-map",       label: "My Trips" },
  { icon: "ti-calendar",  label: "Itinerary", active: true },
  { icon: "ti-wallet",    label: "Budget" },
  { icon: "ti-checklist", label: "Packing List" },
  { icon: "ti-notes",     label: "Journal" },
]

const VIEWS = ["Timeline View", "List View", "By City"]

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export default function TripViewPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const [trip, setTrip]       = useState<Trip | null>(null)
  const [copied, setCopied]   = useState(false)
  const [publishing, setPub]  = useState(false)
  const [activeView, setView] = useState("Timeline View")

  useEffect(() => {
    fetch(`/api/trips/${id}`).then(r => r.json()).then(setTrip)
  }, [id])

  const totalBudget = trip?.stops.flatMap(s => s.activities).reduce((s, a) => s + a.estimatedCost, 0) || 0
  const totalActs   = trip?.stops.flatMap(s => s.activities).length || 0
  const days        = trip ? daysBetween(trip.startDate, trip.endDate) : 0

  const categoryTotals = trip?.stops.flatMap(s => s.activities).reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.estimatedCost
    return acc
  }, {} as Record<string, number>) || {}

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

  async function togglePublish() {
    if (!trip) return
    setPub(true)
    const res  = await fetch(`/api/trips/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !trip.isPublic }),
    })
    const data = await res.json()
    setTrip(prev => prev ? { ...prev, isPublic: data.isPublic, publicSlug: data.publicSlug } : null)
    setPub(false)
  }

  async function copyLink() {
    const url = `${window.location.origin}/share/${trip?.publicSlug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!trip) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F6F2", fontFamily: "'Segoe UI', sans-serif", color: "#aaa" }}>
      Loading...
    </div>
  )

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#F7F6F2" }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 220, background: "#023047", display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0 }}>
          <div style={{ padding: "0 24px 32px", fontSize: 18, fontWeight: 700, color: "white" }}>
            TRAVE<span style={{ fontWeight: 300 }}>LOOP</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFB703", display: "inline-block", marginLeft: 4, verticalAlign: "middle" }} />
          </div>
          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.label} style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: item.active ? "rgba(255,255,255,0.08)" : "transparent", borderLeft: item.active ? "3px solid #FFB703" : "3px solid transparent" }}>
                <i className={`ti ${item.icon}`} style={{ color: item.active ? "#FFB703" : "rgba(255,255,255,0.45)", fontSize: 17 }} />
                <span style={{ color: item.active ? "white" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
              </div>
            ))}
          </nav>
          <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0077B6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>AV</div>
            <div>
              <p style={{ color: "white", fontSize: 12, fontWeight: 600, margin: 0 }}>Avishika</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: 0 }}>Explorer</p>
            </div>
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Gradient header */}
          <div style={{ background: "linear-gradient(120deg,#0077B6,#023047)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
            {/* decorative circles */}
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", top: -120, right: 60 }} />
            <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", bottom: -80, right: 200 }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <button onClick={() => router.back()} style={{ padding: "5px 10px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, background: "transparent", color: "white", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <i className="ti ti-arrow-left" style={{ fontSize: 12 }} /> Back
                    </button>
                    {trip.isPublic && (
                      <span style={{ background: "#FFB703", color: "#023047", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>PUBLIC</span>
                    )}
                  </div>
                  <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{trip.title}</h1>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0 }}>
                    {fmt(trip.startDate)} – {fmt(trip.endDate)} &nbsp;·&nbsp; {trip.stops.length} cities &nbsp;·&nbsp; {totalActs} activities
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => router.push(`/trips/${id}/build`)} style={{ padding: "8px 16px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <i className="ti ti-edit" style={{ fontSize: 14 }} /> Edit
                  </button>
                  <button onClick={togglePublish} disabled={publishing} style={{ padding: "8px 16px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <i className="ti ti-share" style={{ fontSize: 14 }} /> {trip.isPublic ? "✓ Public" : "Share"}
                  </button>
                  {trip.isPublic && (
                    <button onClick={copyLink} style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: "#FFB703", color: "#023047", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats strip */}
              <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                {[
                  { label: "Days",       value: days },
                  { label: "Cities",     value: trip.stops.length },
                  { label: "Activities", value: totalActs },
                  { label: "Budget",     value: `₹${(totalBudget / 1000).toFixed(1)}K`, gold: true },
                ].map((stat, i, arr) => (
                  <>
                    <div key={stat.label} style={{ textAlign: "center" }}>
                      <p style={{ color: stat.gold ? "#FFB703" : "white", fontSize: 18, fontWeight: 700, margin: 0 }}>{stat.value}</p>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</p>
                    </div>
                    {i < arr.length - 1 && <div key={`div-${i}`} style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />}
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", padding: "0 28px", background: "white", borderBottom: "1px solid #ECEAE3" }}>
            {VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "12px 18px", border: "none", background: "transparent", color: activeView === v ? "#0077B6" : "#888", fontSize: 13, fontWeight: activeView === v ? 700 : 400, cursor: "pointer", borderBottom: activeView === v ? "2px solid #0077B6" : "2px solid transparent" }}>
                {v}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", display: "flex", gap: 20 }}>

            {/* Left: Stops timeline */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
              {trip.stops.map((stop, idx) => (
                <div key={stop.id} style={{ display: "flex", gap: 16, marginBottom: 0 }}>

                  {/* Timeline spine */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 48, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: STOP_ACCENTS[idx % 3], border: "2px solid white", boxShadow: `0 0 0 2px ${STOP_ACCENTS[idx % 3]}`, marginTop: 4 }} />
                    {idx < trip.stops.length - 1 && (
                      <div style={{ flex: 1, width: 2, background: "#ECEAE3", margin: "4px 0" }} />
                    )}
                  </div>

                  {/* Stop card */}
                  <div style={{ flex: 1, paddingBottom: 24 }}>
                    {/* Stop label */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ background: STOP_ACCENTS[idx % 3], color: idx === 1 ? "#023047" : "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                        STOP {idx + 1}
                      </span>
                      <span style={{ color: "#023047", fontSize: 14, fontWeight: 700 }}>{stop.cityName}</span>
                      <span style={{ color: "#888", fontSize: 11 }}>{stop.country}</span>
                      <span style={{ marginLeft: "auto", color: "#023047", fontSize: 13, fontWeight: 700 }}>
                        ₹{stop.activities.reduce((s, a) => s + a.estimatedCost, 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Activities */}
                    {stop.activities.length === 0 ? (
                      <div style={{ background: "white", borderRadius: 12, border: "1.5px dashed #C8D8E8", padding: 16, textAlign: "center" }}>
                        <i className="ti ti-plus" style={{ color: "#0077B6", fontSize: 20 }} />
                        <p style={{ color: "#0077B6", fontSize: 12, fontWeight: 600, margin: "6px 0 0" }}>No activities yet — add some!</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {stop.activities.map(act => (
                          <div key={act.id} style={{ background: "white", borderRadius: 12, border: "1px solid #ECEAE3", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ textAlign: "center", minWidth: 44 }}>
                              <p style={{ color: "#023047", fontSize: 12, fontWeight: 700, margin: 0 }}>—</p>
                            </div>
                            <div style={{ width: 1, height: 36, background: "#E0DDD5" }} />
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: STOP_BG[idx % 3], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <i className="ti ti-map-pin" style={{ color: STOP_ACCENTS[idx % 3], fontSize: 15 }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: "#023047", fontSize: 13, fontWeight: 600, margin: 0 }}>{act.name}</p>
                              <p style={{ color: "#888", fontSize: 11, margin: "2px 0 0" }}>
                                {act.durationMinutes ?? "—"} &nbsp;·&nbsp; {act.category} &nbsp;·&nbsp;
                                {act.estimatedCost > 0 ? ` ₹${act.estimatedCost.toLocaleString("en-IN")}` : " Free"}
                              </p>
                            </div>
                            <span style={{ background: "#F1EFE8", color: "#888", fontSize: 10, padding: "2px 8px", borderRadius: 10 }}>Upcoming</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {trip.stops.length === 0 && (
                <div style={{ textAlign: "center", padding: "64px 20px", color: "#aaa" }}>
                  <i className="ti ti-map-off" style={{ fontSize: 48, display: "block", marginBottom: 16, color: "#ddd" }} />
                  <p style={{ fontSize: 15 }}>No stops added yet</p>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Budget summary */}
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #ECEAE3", padding: 16 }}>
                <p style={{ color: "#023047", fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>Total Budget</p>
                <p style={{ color: "#FFB703", fontSize: 24, fontWeight: 700, margin: 0 }}>₹{totalBudget.toLocaleString("en-IN")}</p>
                <p style={{ color: "#aaa", fontSize: 11, margin: "4px 0 0" }}>{trip.stops.length} cities · {totalActs} activities</p>
              </div>

              {/* Pie chart */}
              {chartData.length > 0 && (
                <div style={{ background: "white", borderRadius: 12, border: "1px solid #ECEAE3", padding: 16 }}>
                  <p style={{ color: "#023047", fontSize: 12, fontWeight: 700, margin: "0 0 12px" }}>By Category</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                        {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => v == null ? "" : `₹${Number(v).toLocaleString("en-IN")}`} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Category breakdown */}
              {Object.keys(categoryTotals).length > 0 && (
                <div style={{ background: "white", borderRadius: 12, border: "1px solid #ECEAE3", padding: 16 }}>
                  <p style={{ color: "#023047", fontSize: 12, fontWeight: 700, margin: "0 0 10px" }}>Breakdown</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(categoryTotals).map(([cat, amt]) => (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "#555" }}>{cat}</span>
                        <span style={{ fontWeight: 700, color: "#023047" }}>₹{amt.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* City stops */}
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #ECEAE3", padding: 16 }}>
                <p style={{ color: "#023047", fontSize: 12, fontWeight: 700, margin: "0 0 12px" }}>City Stops</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {trip.stops.map((stop, idx) => (
                    <div key={stop.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: STOP_BG[idx % 3], borderRadius: 8, borderLeft: `3px solid ${STOP_ACCENTS[idx % 3]}` }}>
                      <i className="ti ti-map-pin" style={{ color: STOP_ACCENTS[idx % 3], fontSize: 13 }} />
                      <span style={{ color: "#023047", fontSize: 12, fontWeight: 600 }}>{stop.cityName}</span>
                      <span style={{ color: "#888", fontSize: 11, marginLeft: "auto" }}>Stop {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share card */}
              <div style={{ background: "#023047", borderRadius: 12, padding: 16, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", top: -30, right: -30 }} />
                <i className="ti ti-share" style={{ color: "#FFB703", fontSize: 20, position: "relative" }} />
                <p style={{ color: "white", fontSize: 12, fontWeight: 700, margin: "8px 0 4px", position: "relative" }}>Share this trip</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, margin: "0 0 12px", position: "relative" }}>Let others get inspired</p>
                <button onClick={trip.isPublic ? copyLink : togglePublish} style={{ width: "100%", padding: 9, background: "#FFB703", color: "#023047", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", position: "relative" }}>
                  {trip.isPublic ? (copied ? "Copied!" : "Copy Link") : "Make Public"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
