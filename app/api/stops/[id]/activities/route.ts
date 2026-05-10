// app/api/stops/[id]/activities/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stop = await prisma.stop.findUnique({
    where: { id: params.id },
    include: { trip: true },
  })
  if (!stop) return NextResponse.json({ error: "Stop not found" }, { status: 404 })
  if (stop.trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { name, category, estimatedCost, duration, notes } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Activity name is required" }, { status: 400 })
    }

    // Order = current count so new activity appends to end
    const count = await prisma.activity.count({ where: { stopId: params.id } })

    const activity = await prisma.activity.create({
      data: {
        name,
        category:      category      || "OTHER",
        estimatedCost: Number(estimatedCost) || 0,
        duration:      duration      || null,
        notes:         notes         || null,
        order:         count,
        stopId:        params.id,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error("POST /api/stops/[id]/activities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}