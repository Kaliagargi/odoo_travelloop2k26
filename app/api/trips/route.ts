// app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getUserFromRequest } from "@/app/lib/auth"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const trips = await prisma.trip.findMany({
    where: { userId: user.userId },
    include: {
      _count: { select: { stops: true } },
      stops: {
        include: {
          activities: { select: { estimatedCost: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(trips)
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { title, description, startDate, endDate, imageUrl } = await request.json()

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, start date and end date are required" },
        { status: 400 }
      )
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        description: description || "",
        startDate:   new Date(startDate),
        endDate:     new Date(endDate),
        imageUrl:    imageUrl || null,
        publicSlug:  nanoid(6),
        userId:      user.userId,
      },
    })

    return NextResponse.json(trip, { status: 201 })
  } catch (error) {
    console.error("POST /api/trips error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}