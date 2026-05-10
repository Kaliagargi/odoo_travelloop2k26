"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"

type Activity = { id: string; name: string; category: string; estimatedCost: number; duration?: string }
type Stop     = { id: string; cityName: string; country: string; imageUrl?: string; activities: Activity[] }
type Trip     = { id: string; title: string; startDate: string; endDate: string; stops: Stop[] }
type City     = { id: string; name: string; country: string; imageUrl: string; costPerDay: number }

const CATEGORIES = ["TRANSPORT","STAY","FOOD","ACTIVITY","SHOPPING","OTHER"]

const NAV_ITEMS = [
  { icon: "ti-home",      label: "Dashboard" },
  { icon: "ti-map",       label: "My Trips",   active: true },
  { icon: "ti-calendar",  label: "Itinerary" },
  { icon: "ti-wallet",    label: "Budget" },
  { icon: "ti-checklist", label: "Packing List" },
  { icon: "ti-notes",     label: "Journal" },
]

const CATEGORY_COLOR: Record<string, string> = {
  TRANSPORT: "#E6F1FB",  STAY: "#E8F8EE",  FOOD: "#FFF5E0",
  ACTIVITY:  "#F3EEFF",  SHOPPING: "#FDE8E8", OTHER: "#F7F6F2",
}
const CATEGORY_TEXT: Record<string, string> = {
  TRANSPORT: "#0077B6", STAY: "#1a7a43", FOOD: "#c47a00",
  ACTIVITY:  "#6b2fa0", SHOPPING: "#a02020", OTHER: "#555",
}

export default function BuildPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const [trip, setTrip]             = useState<Trip | null>(null)
  const [search, setSearch]         = useState("")
  const [cities, setCities]         = useState<City[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [addingTo, setAddingTo]     = useState<string | null>(null)
  const [actForm, setActForm]       = useState({ name: "", category: "OTHER", estimatedCost: "", duration: "" })

  const fetchTrip = useCallback(async () => {
    const res  = await fetch(`/api/trips/${id}`)
    const data = await res.json()
    setTrip(data)
  }, [id])

  useEffect(() => { fetchTrip() }, [fetchTrip])

  useEffect(() => {
    if (!search) { setCities([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/cities?search=${search}`)
      setCities(await res.json())
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const totalBudget = trip?.stops
    .flatMap(s => s.activities)
    .reduce((sum, a) => sum + a.estimatedCost, 0) || 0

  async function addStop(city: City) {
    await fetch(`/api/trips/${id}/stops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityName: city.name, country: city.country, imageUrl: city.imageUrl }),
    })
    setSearch(""); setCities([]); setShowSearch(false)
    fetchTrip()
  }

  async function deleteStop(stopId: string) {
    await fetch(`/api/stops/${stopId}`, { method: "DELETE" })
    fetchTrip()
  }

  async function addActivity(stopId: string) {
    if (!actForm.name) return
    await fetch(`/api/stops/${stopId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...actForm, estimatedCost: Number(actForm.estimatedCost) || 0 }),
    })
    setActForm({ name: "", category: "OTHER", estimatedCost: "", duration: "" })
    setAddingTo(null)
    fetchTrip()
  }

  async function deleteActivity(actId: string) {
    await fetch(`/api/activities/${actId}`, { method: "DELETE" })
    fetchTrip()
  }

  if (!trip) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F6F2", fontFamily: "'Segoe UI', sans-serif", color: "#aaa" }}>
      Loading...
    </div>
  )

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
              <div key={item.label} style={{
                padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                background: item.active ? "rgba(255,255,255,0.08)" : "transparent",
                borderLeft: item.active ? "3px solid #FFB703" : "3px solid transparent",
              }}>
                <i className={`ti ${item.icon}`} style={{ color: item.active ? "white" : "rgba(255,255,255,0.45)", fontSize: 17 }} />
                <span style={{ color: item.active ? "white" : "rgba(255,255,255,0.45)", fontSize: 13 }}>{item.label}</span>
              </div>
            ))}
          </nav>

          <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0077B6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>
              AV
            </div>
            <div>
              <p style={{ color: "white", fontSize: 12, fontWeight: 600 }}>Avishika</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Explorer</p>
            </div>
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <button onClick={() => router.back()} style={{ padding: "8px 12px", border: "1px solid #E0DDD5", borderRadius: 8, background: "white", cursor: "pointer", color: "#555", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Back
            </button>
            <div>
              <p style={{ color: "#888", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Build Your Route</p>
              <h1 style={{ color: "#023047", fontSize: 26, fontWeight: 700 }}>{trip.title}</h1>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "#888" }}>Total Budget</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#FFB703" }}>₹{totalBudget.toLocaleString("en-IN")}</p>
              </div>
              <button onClick={() => router.push(`/trips/${id}`)} style={{ padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#023047", color: "white", border: "none" }}>
                View Itinerary →
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "white", border: "1.5px solid #E0DDD5", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
            <i className="ti ti-search" style={{ color: "#aaa", fontSize: 18 }} />
            <input
              type="text"
              placeholder="Search cities to add, e.g. Jaipur, Bali, Paris..."
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#023047", background: "transparent", fontFamily: "'Segoe UI', sans-serif" }}
            />
            <i className="ti ti-adjustments-horizontal" style={{ color: "#0077B6", cursor: "pointer", fontSize: 18 }} />
          </div>

          {/* City search results */}
          {showSearch && search && (
            <div style={{ background: "white", border: "1.5px solid #ECEAE3", borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              {cities.length > 0 ? cities.map(city => (
                <div key={city.id} onClick={() => addStop(city)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F0F6FB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <img src={city.imageUrl} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#023047" }}>{city.name}</p>
                    <p style={{ fontSize: 12, color: "#888" }}>{city.country} · ~₹{city.costPerDay.toLocaleString()}/day</p>
                  </div>
                  <span style={{ marginLeft: "auto", padding: "5px 14px", borderRadius: 20, background: "#023047", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</span>
                </div>
              )) : (
                <p style={{ textAlign: "center", fontSize: 13, color: "#aaa", padding: "16px 0" }}>No cities found for "{search}"</p>
              )}
            </div>
          )}

          {/* Add city button */}
          <button onClick={() => { setShowSearch(!showSearch); setSearch("") }} style={{ width: "100%", border: "2px dashed #E0DDD5", borderRadius: 14, padding: "14px 0", background: "white", color: "#0077B6", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <i className="ti ti-plus" style={{ fontSize: 16 }} /> Add a City to Your Route
          </button>

          {/* Stops list */}
          {trip.stops.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 20px", color: "#aaa" }}>
              <i className="ti ti-map-off" style={{ fontSize: 48, display: "block", marginBottom: 16, color: "#ddd" }} />
              <p style={{ fontSize: 15 }}>Add your first city to start building your route</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {trip.stops.map((stop, idx) => (
                <div key={stop.id} style={{ background: "white", borderRadius: 14, border: "1.5px solid #ECEAE3", overflow: "hidden" }}>

                  {/* Stop header image */}
                  <div style={{ position: "relative", height: 120 }}>
                    <img
                      src={stop.imageUrl || `https://source.unsplash.com/800x300/?${stop.cityName}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(2,48,71,0.55)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
                      <div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: 1 }}>STOP {idx + 1}</p>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: "2px 0" }}>{stop.cityName}</h3>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{stop.country}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Stop total</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: "#FFB703" }}>
                          ₹{stop.activities.reduce((s, a) => s + a.estimatedCost, 0).toLocaleString("en-IN")}
                        </p>
                        <button onClick={() => deleteStop(stop.id)} style={{ fontSize: 11, color: "#f87171", background: "none", border: "none", cursor: "pointer", marginTop: 4, padding: 0 }}>
                          Remove city
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div style={{ padding: "16px 20px" }}>
                    {stop.activities.length > 0 && (
                      <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        {stop.activities.map(act => (
                          <div key={act.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#F7F6F2", borderRadius: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: CATEGORY_COLOR[act.category] || "#F7F6F2", color: CATEGORY_TEXT[act.category] || "#555" }}>
                                {act.category}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#023047" }}>{act.name}</span>
                              {act.duration && <span style={{ fontSize: 11, color: "#aaa" }}>{act.duration}</span>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#023047" }}>₹{act.estimatedCost.toLocaleString("en-IN")}</span>
                              <button onClick={() => deleteActivity(act.id)} style={{ color: "#ccc", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add activity form */}
                    {addingTo === stop.id ? (
                      <div style={{ border: "1.5px solid #E0DDD5", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <input
                            placeholder="Activity name"
                            value={actForm.name}
                            onChange={e => setActForm(p => ({ ...p, name: e.target.value }))}
                            style={{ border: "1.5px solid #E0DDD5", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "'Segoe UI', sans-serif", color: "#023047" }}
                          />
                          <select
                            value={actForm.category}
                            onChange={e => setActForm(p => ({ ...p, category: e.target.value }))}
                            style={{ border: "1.5px solid #E0DDD5", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "'Segoe UI', sans-serif", color: "#023047", background: "white", cursor: "pointer" }}
                          >
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <input
                            placeholder="Cost (₹)"
                            type="number"
                            value={actForm.estimatedCost}
                            onChange={e => setActForm(p => ({ ...p, estimatedCost: e.target.value }))}
                            style={{ border: "1.5px solid #E0DDD5", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "'Segoe UI', sans-serif", color: "#023047" }}
                          />
                          <input
                            placeholder="Duration (e.g. 2 hours)"
                            value={actForm.duration}
                            onChange={e => setActForm(p => ({ ...p, duration: e.target.value }))}
                            style={{ border: "1.5px solid #E0DDD5", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "'Segoe UI', sans-serif", color: "#023047" }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => addActivity(stop.id)} style={{ flex: 1, background: "#023047", color: "white", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            <i className="ti ti-plus" style={{ verticalAlign: -2, marginRight: 6 }} />Add Activity
                          </button>
                          <button onClick={() => setAddingTo(null)} style={{ padding: "9px 18px", border: "1.5px solid #E0DDD5", borderRadius: 8, background: "white", fontSize: 13, color: "#555", cursor: "pointer" }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingTo(stop.id)} style={{ width: "100%", border: "1.5px dashed #E0DDD5", borderRadius: 10, padding: "10px 0", background: "transparent", fontSize: 13, color: "#aaa", cursor: "pointer" }}>
                        + Add activity
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
