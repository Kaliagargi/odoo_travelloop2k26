// app/api/checklist/route.ts
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

  const items = await prisma.checklistItem.findMany({
    where: { tripId },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { tripId, label, category } = await request.json()
  if (!tripId || !label) return NextResponse.json({ error: "tripId and label required" }, { status: 400 })

  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const item = await prisma.checklistItem.create({
    data: {
      label,
      category: category || "OTHER",
      tripId,
    },
  })

  return NextResponse.json(item, { status: 201 })
}