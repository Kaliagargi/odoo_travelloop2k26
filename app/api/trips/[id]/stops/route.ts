import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { cityName, country, imageUrl, startDate, endDate } = await request.json()
  if (!cityName || !country) return NextResponse.json({ error: "City and country required" }, { status: 400 })

  const count = await prisma.stop.count({ where: { tripId: id } })

  const stop = await prisma.stop.create({
    data: {
      cityName,
      country,
      imageUrl: imageUrl || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate:   endDate   ? new Date(endDate)   : null,
      order:  count,
      tripId: id,
    },
    include: { activities: true }
  })

  return NextResponse.json(stop, { status: 201 })
}