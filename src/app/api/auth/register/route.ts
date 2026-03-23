import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // In production, save to database:
    // const existingUser = await prisma.user.findUnique({ where: { email } });
    // if (existingUser) {
    //   return NextResponse.json(
    //     { error: "Email already registered" },
    //     { status: 400 }
    //   );
    // }
    //
    // const user = await prisma.user.create({
    //   data: {
    //     name,
    //     email,
    //     password: hashedPassword,
    //   },
    // });

    // For development, return success
    console.log("User registered:", { name, email, hashedPassword: "***" });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
