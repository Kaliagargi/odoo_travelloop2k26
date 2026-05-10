import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { prisma } from "@/app/lib/db";
import type { User } from "@/types";
import { NextRequest } from "next/server";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = verifyToken(token);

    const userFromDb = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!userFromDb) return null;

    const { password, ...userWithoutPassword } = userFromDb;

    return userWithoutPassword as User;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

export const getUserFromRequest = (request: NextRequest): { userId: string } | null => {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) return null
    return verifyToken(token)  // already returns { userId }
  } catch {
    return null
  }
}