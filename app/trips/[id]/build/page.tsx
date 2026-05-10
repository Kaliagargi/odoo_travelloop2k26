"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"

type Activity = { id: string; name: string; category: string; estimatedCost: number; duration?: string }
type Stop     = { id: string; cityName: string; country: string; imageUrl?: string; activities: Activity[] }
type Trip     = { id: string; title: string; startDate: string; endDate: string; stops: Stop[] }
type City     = { id: string; name: string; country: string; imageUrl: string; costPerDay: number }

const CATEGORIES = ["TRANSPORT","STAY","FOOD","ACTIVITY","SHOPPING","OTHER"]

export default function BuildPage() {
  const { id }    = useParams()
  const router    = useRouter()
  const [trip, setTrip]           = useState<Trip | null>(null)
  const [search, setSearch]       = useState("")
  const [cities, setCities]       = useState<City[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [addingTo, setAddingTo]   = useState<string | null>(null)
  const [actForm, setActForm]     = useState({ name: "", category: "OTHER", estimatedCost: "", durationMinutes: "" })

  const fetchTrip = useCallback(async () => {
    const res = await fetch(`/api/trips/${id}`)
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
    setActForm({ name: "", category: "OTHER", estimatedCost: "", durationMinutes: "" })
    setAddingTo(null)
    fetchTrip()
  }

  async function deleteActivity(actId: string) {
    await fetch(`/api/activities/${actId}`, { method: "DELETE" })
    fetchTrip()
  }

  if (!trip) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{trip.title}</h1>
          <p className="text-sm text-gray-400">
            {new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-right">
            <p className="text-xs text-gray-400">Total budget</p>
            <p className="text-lg font-bold text-amber-500">
              ₹{totalBudget.toLocaleString("en-IN")}
            </p>
          </div>
          <button onClick={() => router.push(`/trips/${id}`)}
            className="bg-amber-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-amber-600">
            View Itinerary →
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Add city button */}
        <button onClick={() => setShowSearch(!showSearch)}
          className="w-full border-2 border-dashed border-amber-300 rounded-2xl py-4 text-amber-500 font-medium hover:border-amber-500 hover:bg-amber-50 transition mb-8">
          + Add a city
        </button>

        {/* City search */}
        {showSearch && (
          <div className="bg-white border rounded-2xl p-4 mb-6 shadow-sm">
            <input
              autoFocus
              placeholder="Search city... (Paris, Tokyo, Goa...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 mb-3"
            />
            {cities.length > 0 && (
              <div className="space-y-2">
                {cities.map(city => (
                  <div key={city.id}
                    onClick={() => addStop(city)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 cursor-pointer transition">
                    <img src={city.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-sm">{city.name}</p>
                      <p className="text-xs text-gray-400">{city.country} · ~₹{city.costPerDay.toLocaleString()}/day</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {search && cities.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No cities found for "{search}"</p>
            )}
          </div>
        )}

        {/* Stops */}
        {trip.stops.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <p className="text-5xl mb-4">✈️</p>
            <p className="text-lg">Add your first city to start building</p>
          </div>
        ) : (
          <div className="space-y-6">
            {trip.stops.map((stop, idx) => (
              <div key={stop.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                {/* Stop header */}
                <div className="relative h-32">
                  <img src={stop.imageUrl || `https://source.unsplash.com/800x300/?${stop.cityName}`}
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-5">
                    <div>
                      <p className="text-xs text-white/70 font-medium">Stop {idx + 1}</p>
                      <h3 className="text-xl font-bold text-white">{stop.cityName}</h3>
                      <p className="text-sm text-white/70">{stop.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">Stop total</p>
                      <p className="text-lg font-bold text-amber-300">
                        ₹{stop.activities.reduce((s, a) => s + a.estimatedCost, 0).toLocaleString("en-IN")}
                      </p>
                      <button onClick={() => deleteStop(stop.id)}
                        className="text-xs text-red-300 hover:text-red-200 mt-1">
                        Remove city
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div className="p-5">
                  {stop.activities.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {stop.activities.map(act => (
                        <div key={act.id}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              {act.category}
                            </span>
                            <span className="text-sm font-medium">{act.name}</span>
                            {act.duration && <span className="text-xs text-gray-400">{act.duration}</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-700">
                              ₹{act.estimatedCost.toLocaleString("en-IN")}
                            </span>
                            <button onClick={() => deleteActivity(act.id)}
                              className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add activity form */}
                  {addingTo === stop.id ? (
                    <div className="border border-amber-200 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="Activity name"
                          value={actForm.name}
                          onChange={e => setActForm(p => ({...p, name: e.target.value}))}
                          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <select
                          value={actForm.category}
                          onChange={e => setActForm(p => ({...p, category: e.target.value}))}
                          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="Cost (₹)"
                          type="number"
                          value={actForm.estimatedCost}
                          onChange={e => setActForm(p => ({...p, estimatedCost: e.target.value}))}
                          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <input
                          placeholder="Duration (e.g. 2 hours)"
                          value={actForm.durationMinutes}
                          onChange={e => setActForm(p => ({...p, duration: e.target.value}))}
                          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addActivity(stop.id)}
                          className="flex-1 bg-amber-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-amber-600">
                          Add activity
                        </button>
                        <button onClick={() => setAddingTo(null)}
                          className="px-4 border rounded-lg text-sm text-gray-500 hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingTo(stop.id)}
                      className="w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-amber-300 hover:text-amber-500 transition">
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
  )
}