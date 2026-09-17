import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isDatabaseConfigured()) {
      // Demo / Local development mode fallback when MongoDB URI is not set
      const demoUser = {
        userId: "demo-user-" + Date.now(),
        name,
        email: cleanEmail,
      };
      const token = await signToken(demoUser);

      const res = NextResponse.json(
        {
          message: "Account created (Demo Mode - MongoDB not configured)",
          user: demoUser,
          isDemo: true,
        },
        { status: 201 }
      );

      res.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return res;
    }

    await connectDB();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const token = await signToken(tokenPayload);

    const res = NextResponse.json(
      {
        message: "Registration successful",
        user: tokenPayload,
      },
      { status: 201 }
    );

    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error: any) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
