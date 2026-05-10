// app/api/cities/route.ts
// PUBLIC — no auth required, powers the city search bar
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const region = searchParams.get("region")

  try {
    const cities = await prisma.city.findMany({
      where: {
        ...(search && {
          name: { contains: search, mode: "insensitive" }
        }),
        ...(region && { region }),
      },
      take:    10,
      orderBy: { name: "asc" },
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error("GET /api/cities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}