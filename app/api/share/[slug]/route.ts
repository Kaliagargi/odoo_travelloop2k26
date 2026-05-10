import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const trip = await prisma.trip.findUnique({
      where: { publicSlug: slug },
      include: {
        stops: {
          orderBy: { order: "asc" },
          include: {
            activities: { orderBy: { order: "asc" } }
          }
        },
        user: {
          select: { name: true, email: true }
        },
      },
    })

    if (!trip || !trip.isPublic) {
      return NextResponse.json({ error: "Trip not found or not publicly shared" }, { status: 404 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error("GET /api/share/[slug] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}