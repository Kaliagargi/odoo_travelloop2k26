"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:       form.get("title"),
        description: form.get("description"),
        startDate:   form.get("startDate"),
        endDate:     form.get("endDate"),
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push(`/trips/${data.id}/build`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-2xl border p-8 space-y-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Plan a new trip</h1>
          <p className="text-gray-500 text-sm mt-1">Start by giving your trip a name and dates</p>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Trip name</label>
          <input name="title" required placeholder="e.g. Europe Summer 2025"
            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3} placeholder="What's this trip about?"
            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start date</label>
            <input name="startDate" type="date" required
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End date</label>
            <input name="endDate" type="date" required
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-amber-500 text-white rounded-xl py-3 font-semibold hover:bg-amber-600 disabled:opacity-50 transition">
          {loading ? "Creating..." : "Create trip →"}
        </button>
      </form>
    </div>
  )
}