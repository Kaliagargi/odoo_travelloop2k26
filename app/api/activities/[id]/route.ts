// app/api/activities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
    include: { stop: { include: { trip: true } } },
  })
  if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 })
  if (activity.stop.trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const data = await request.json()

    const updated = await prisma.activity.update({
      where: { id: params.id },
      data: {
        ...(data.name          !== undefined && { name:          data.name }),
        ...(data.category      !== undefined && { category:      data.category }),
        ...(data.estimatedCost !== undefined && { estimatedCost: Number(data.estimatedCost) }),
        ...(data.duration      !== undefined && { duration:      data.duration }),
        ...(data.notes         !== undefined && { notes:         data.notes }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/activities/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
    include: { stop: { include: { trip: true } } },
  })
  if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 })
  if (activity.stop.trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.activity.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}