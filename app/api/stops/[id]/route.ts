// app/api/stops/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function PATCH(
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
    const data = await request.json()

    const updated = await prisma.stop.update({
      where: { id: params.id },
      data: {
        ...(data.cityName  !== undefined && { cityName:  data.cityName }),
        ...(data.country   !== undefined && { country:   data.country }),
        ...(data.imageUrl  !== undefined && { imageUrl:  data.imageUrl }),
        ...(data.order     !== undefined && { order:     data.order }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate   !== undefined && { endDate:   new Date(data.endDate) }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/stops/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }:  { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stop = await prisma.stop.findUnique({
    where: { id },
    include: { trip: true },
  })
  if (!stop) return NextResponse.json({ error: "Stop not found" }, { status: 404 })
  if (stop.trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  
  await prisma.stop.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}