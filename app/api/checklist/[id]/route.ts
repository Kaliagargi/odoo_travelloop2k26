// app/api/checklist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const item = await prisma.checklistItem.findUnique({
    where: { id },
    include: { trip: true },
  })
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })
  if (item.trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const data = await request.json()

  const updated = await prisma.checklistItem.update({
    where: { id },
    data: {
      ...(data.label  !== undefined && { label:  data.label }),
      ...(data.packed !== undefined && { packed: data.packed }),
      ...(data.category !== undefined && { category: data.category }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const item = await prisma.checklistItem.findUnique({
    where: { id },
    include: { trip: true },
  })
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })
  if (item.trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.checklistItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}