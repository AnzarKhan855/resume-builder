import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const resume = await Resume.create(body);

    return NextResponse.json(
      { message: "Resume saved successfully", resume },
      { status: 201 }
    );
  } catch (error) {
    console.error("SAVE_RESUME_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to save resume" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const resumes = await Resume.find().sort({ createdAt: -1 });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("FETCH_RESUME_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}