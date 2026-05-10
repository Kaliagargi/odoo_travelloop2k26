// app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const note = await prisma.note.findUnique({
    where:   { id: params.id },
    include: { trip: true },
  })
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 })
  if (note.trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { content } = await request.json()

    const updated = await prisma.note.update({
      where: { id: params.id },
      data:  { content },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }:  { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const note = await prisma.note.findUnique({
    where:   { id },
    include: { trip: true },
  })
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 })
  if (note.trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}