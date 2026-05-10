// app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tripId = searchParams.get("tripId")

  if (!tripId) {
    return NextResponse.json({ error: "tripId query param is required" }, { status: 400 })
  }

  // Verify the trip belongs to this user
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const notes = await prisma.note.findMany({
    where:   { tripId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(notes)
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { tripId, content, stopId } = await request.json()

    if (!tripId || !content) {
      return NextResponse.json(
        { error: "tripId and content are required" },
        { status: 400 }
      )
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({ where: { id: tripId } })
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const note = await prisma.note.create({
      data: {
        tripId,
        content,
        stopId: stopId || null,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("POST /api/notes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}