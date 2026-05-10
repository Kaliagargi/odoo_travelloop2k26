"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

type Activity = { id: string; name: string; category: string; estimatedCost: number; durationMinutes?: string }
type Stop     = { id: string; cityName: string; country: string; imageUrl?: string; activities: Activity[] }
type Trip     = { id: string; title: string; description: string; startDate: string; endDate: string; isPublic: boolean; publicSlug: string; stops: Stop[] }

const COLORS = ["#F59E0B","#3B82F6","#10B981","#EF4444","#8B5CF6","#F97316"]

export default function TripViewPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const [trip, setTrip]     = useState<Trip | null>(null)
  const [copied, setCopied] = useState(false)
  const [publishing, setPub] = useState(false)

  useEffect(() => {
    fetch(`/api/trips/${id}`).then(r => r.json()).then(setTrip)
  }, [id])

  const totalBudget = trip?.stops.flatMap(s => s.activities).reduce((s, a) => s + a.estimatedCost, 0) || 0

  const categoryTotals = trip?.stops.flatMap(s => s.activities).reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.estimatedCost
    return acc
  }, {} as Record<string, number>) || {}

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

  async function togglePublish() {
    if (!trip) return
    setPub(true)
    const res = await fetch(`/api/trips/${id}/publish`, {
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

  if (!trip) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <p className="text-sm text-gray-400">{trip.description}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/trips/${id}/build`)}
              className="border px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50">
              Edit
            </button>
            <button onClick={togglePublish} disabled={publishing}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${trip.isPublic ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {trip.isPublic ? "✓ Public" : "Make Public"}
            </button>
            {trip.isPublic && (
              <button onClick={copyLink}
                className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600">
                {copied ? "Copied!" : "Copy Link"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 gap-6">
        {/* Stops — left 2/3 */}
        <div className="col-span-2 space-y-6">
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="bg-white border rounded-2xl overflow-hidden">
              <div className="relative h-28">
                <img src={stop.imageUrl || `https://source.unsplash.com/800x300/?${stop.cityName}`}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center px-5">
                  <div>
                    <p className="text-xs text-white/60">Stop {idx + 1}</p>
                    <h3 className="text-xl font-bold text-white">{stop.cityName}, {stop.country}</h3>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-white/60">Stop cost</p>
                    <p className="text-lg font-bold text-amber-300">
                      ₹{stop.activities.reduce((s, a) => s + a.estimatedCost, 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {stop.activities.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No activities added</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs border-b">
                        <th className="text-left pb-2">Excursion</th>
                        <th className="text-left pb-2">Category</th>
                        <th className="text-left pb-2">Duration</th>
                        <th className="text-right pb-2">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stop.activities.map(act => (
                        <tr key={act.id} className="border-b last:border-0">
                          <td className="py-2 font-medium">{act.name}</td>
                          <td className="py-2">
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              {act.category}
                            </span>
                          </td>
                          <td className="py-2 text-gray-400">{act.durationMinutes ?? "—"}</td>
                          <td className="py-2 text-right font-semibold">
                            ₹{act.estimatedCost.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Budget sidebar — right 1/3 */}
        <div className="space-y-4">
          <div className="bg-white border rounded-2xl p-5">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Budget</p>
            <p className="text-3xl font-bold text-amber-500">
              ₹{totalBudget.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mt-1">{trip.stops.length} cities · {trip.stops.flatMap(s => s.activities).length} activities</p>
          </div>

          {chartData.length > 0 && (
            <div className="bg-white border rounded-2xl p-5">
              <p className="text-sm font-medium mb-4">By category</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                 <Tooltip
                   formatter={(v) =>
                   v == null ? "" : `₹${Number(v).toLocaleString("en-IN")}`
                 }
                    />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white border rounded-2xl p-5 space-y-2">
            {Object.entries(categoryTotals).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-gray-600">{cat}</span>
                <span className="font-semibold">₹{amt.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}