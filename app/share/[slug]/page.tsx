import { notFound } from "next/navigation"

type Activity = {
  id: string
  name: string
  category: string
  estimatedCost: number
  durationMinutes?: number
}

type Stop = {
  id: string
  cityName: string
  country: string
  activities: Activity[]
}

type Trip = {
  title: string
  description: string
  startDate: string
  endDate: string
  stops: Stop[]
  user: { name: string }
}

async function getTrip(slug: string): Promise<Trip | null> {
  const res = await fetch(`http://localhost:3000/api/share/${slug}`, {
    cache: "no-store",
  })

  if (!res.ok) return null
  return res.json()
}

export default async function SharePage({
  params,
}: {
  params: { slug: string }
}) {
  const trip = await getTrip(params.slug)

  if (!trip) notFound()

  const total = trip.stops
    .flatMap((s) => s.activities)
    .reduce((sum, a) => sum + a.estimatedCost, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-amber-500 font-bold text-lg">Traveloop</p>
          <p className="text-xs text-gray-400">Shared itinerary</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="bg-white border rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
          <p className="text-gray-500 mb-4">{trip.description}</p>

          <div className="flex gap-6 text-sm text-gray-400 flex-wrap">
            <span>
              📅 {new Date(trip.startDate).toLocaleDateString()} →{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </span>
            <span>✈️ {trip.stops.length} cities</span>
            <span>👤 by {trip.user.name}</span>
          </div>
        </div>

        {/* BUDGET */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-amber-600">Total estimated budget</p>
            <p className="text-2xl font-bold text-amber-600">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>
          <span className="text-4xl">💰</span>
        </div>

        {/* STOPS */}
        <div className="space-y-6">
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="bg-white border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between">
                <div>
                  <p className="text-xs text-gray-400">Stop {idx + 1}</p>
                  <h3 className="font-bold text-lg">
                    {stop.cityName}, {stop.country}
                  </h3>
                </div>

                <p className="font-bold text-amber-500">
                  ₹
                  {stop.activities
                    .reduce((s, a) => s + a.estimatedCost, 0)
                    .toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-5 space-y-2">
                {stop.activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex justify-between items-center py-1.5"
                  >
                    <div className="flex gap-3 items-center">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {act.category}
                      </span>
                      <span className="text-sm">{act.name}</span>
                      {act.durationMinutes && (
                        <span className="text-xs text-gray-400">
                          {act.durationMinutes} min
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-semibold">
                      ₹{act.estimatedCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Made with <span className="text-amber-500 font-semibold">Traveloop</span>
        </p>
      </div>
    </div>
  )
}