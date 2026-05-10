// app/api/share/[slug]/route.ts
// PUBLIC — no auth required, anyone with the link can view
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { publicSlug: params.slug },
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

    // Return 404 if trip not found OR if it exists but is not public
    if (!trip || !trip.isPublic) {
      return NextResponse.json(
        { error: "Trip not found or not publicly shared" },
        { status: 404 }
      )
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error("GET /api/share/[slug] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}