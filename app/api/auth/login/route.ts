import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import { comparePassword, signToken, AUTH_COOKIE_NAME } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isDatabaseConfigured()) {
      // Demo login when MongoDB is not configured
      const demoUser = {
        userId: "demo-user-1",
        name: cleanEmail.split("@")[0] || "Demo User",
        email: cleanEmail,
      };
      const token = await signToken(demoUser);

      const res = NextResponse.json({
        message: "Login successful (Demo Mode)",
        user: demoUser,
        isDemo: true,
      });

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

    const user = await User.findOne({ email: cleanEmail });
    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const token = await signToken(tokenPayload);

    const res = NextResponse.json({
      message: "Login successful",
      user: tokenPayload,
    });

    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error: any) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Login failed" },
      { status: 500 }
    );
  }
}
