import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tripId = searchParams.get("tripId")
  if (!tripId) return NextResponse.json({ error: "tripId required" }, { status: 400 })

  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const notes = await prisma.note.findMany({
    where: { tripId },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(notes)
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { tripId, content, stopId } = await request.json()
  if (!tripId || !content) return NextResponse.json({ error: "tripId and content required" }, { status: 400 })

  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const note = await prisma.note.create({
    data: { content, tripId, stopId: stopId || null }
  })
  return NextResponse.json(note, { status: 201 })
}