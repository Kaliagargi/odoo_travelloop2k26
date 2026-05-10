import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { hashPassword, generateToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { phonenumber, email, password, name } = await request.json();

    if (!phonenumber || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phonenumber,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Registration failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}