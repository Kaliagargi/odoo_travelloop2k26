import { getCurrentUser } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Dashboard() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-amber-500">Traveloop</span>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-600">Hey, {user.name} 👋</span>
          <Link href="/trips" className="text-sm text-gray-600">My Trips</Link>
          <Link href="/api/auth/logout" className="text-sm text-gray-500">Logout</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Where to next?</h1>
        <p className="text-gray-500 mb-10">Plan your perfect trip — cities, activities, budgets.</p>
        <Link href="/trips/new"
          className="bg-amber-500 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-amber-600 transition">
          + Plan a New Trip
        </Link>

        <div className="mt-16 grid grid-cols-3 gap-6 text-left">
          {["Paris", "Tokyo", "Bali"].map(city => (
            <div key={city} className="bg-white rounded-2xl overflow-hidden border hover:shadow-md transition">
              <img src={`https://source.unsplash.com/400x200/?${city},travel`} className="w-full h-36 object-cover" />
              <div className="p-4">
                <p className="font-semibold">{city}</p>
                <p className="text-sm text-gray-400">Popular destination</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}