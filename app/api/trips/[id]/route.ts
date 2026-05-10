import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: {
          activities: { orderBy: { order: "asc" } }
        }
      },
      notes:     { orderBy: { createdAt: "desc" } },
      checklist: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json(trip)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const data = await request.json()

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        ...(data.title       !== undefined && { title:       data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl    !== undefined && { imageUrl:    data.imageUrl }),
        ...(data.startDate   !== undefined && { startDate:   new Date(data.startDate) }),
        ...(data.endDate     !== undefined && { endDate:     new Date(data.endDate) }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/trips/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.trip.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}