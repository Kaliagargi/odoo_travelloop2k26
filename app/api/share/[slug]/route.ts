import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const trip = await prisma.trip.findUnique({
    where: { publicSlug: slug },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: {
          activities: {
            orderBy: { order: "asc" },
          },
        },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  })

  if (!trip || !trip.isPublic) {
    return NextResponse.json(
      { error: "Trip not found or not public" },
      { status: 404 }
    )
  }

  return NextResponse.json(trip)
}