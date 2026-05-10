// app/api/trips/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"
import { nanoid } from "nanoid"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const trip = await prisma.trip.findUnique({ where: { id: params.id } })
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.userId !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { isPublic } = await request.json()

  // Keep existing slug or generate a new one — slug never changes once set
  const publicSlug = trip.publicSlug || nanoid(6)

  const updated = await prisma.trip.update({
    where: { id: params.id },
    data: { isPublic, publicSlug },
  })

  return NextResponse.json({
    isPublic:   updated.isPublic,
    publicSlug: updated.publicSlug,
  })
}