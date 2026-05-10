// app/api/auth/me/route.ts
// Used by client components to get the current logged-in user
import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/app/lib/auth"
import { prisma } from "@/app/lib/db"

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const userFromDb = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id:          true,
        name:        true,
        email:       true,
        createdAt:   true,
        // add phonenumber here if it exists in your schema
      },
    })

    if (!userFromDb) return NextResponse.json({ error: "User not found" }, { status: 404 })
    return NextResponse.json(userFromDb)
  } catch (error) {
    console.error("GET /api/auth/me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}