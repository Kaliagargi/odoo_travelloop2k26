"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Trip = { id: string; title: string; description: string; startDate: string; endDate: string; isPublic: boolean; stops: { activities: { estimatedCost: number }[] }[] }

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/trips").then(r => r.json()).then(data => { setTrips(data); setLoading(false) })
  }, [])

  async function deleteTrip(id: string) {
    if (!confirm("Delete this trip?")) return
    await fetch(`/api/trips/${id}`, { method: "DELETE" })
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  const totalBudget = (trip: Trip) =>
    trip.stops.flatMap(s => s.activities).reduce((s, a) => s + a.estimatedCost, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold text-amber-500">Traveloop</Link>
        <Link href="/trips/new" className="bg-amber-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-amber-600">
          + New Trip
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Trips</h1>
        {loading ? (
          <p className="text-center text-gray-400 py-20">Loading...</p>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No trips yet</p>
            <Link href="/trips/new" className="bg-amber-500 text-white px-6 py-3 rounded-xl font-medium">
              Plan your first trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white border rounded-2xl p-6 hover:shadow-sm transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{trip.title}</h3>
                  {trip.isPublic && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Public</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{trip.description}</p>
                <div className="text-sm text-gray-400 mb-4">
                  📅 {new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-500">₹{totalBudget(trip).toLocaleString("en-IN")}</span>
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/trips/${trip.id}/build`)}
                      className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
                    <button onClick={() => router.push(`/trips/${trip.id}`)}
                      className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600">View</button>
                    <button onClick={() => deleteTrip(trip.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}