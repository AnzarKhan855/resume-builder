import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
import { normalizeResume, prepareResumeForSave } from "@/src/lib/resume-normalizer";
import { getSessionUser } from "@/src/lib/auth";
import { memoryStore } from "@/src/lib/memory-store";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    const body = await request.json();

    const prepared = prepareResumeForSave({
      ...body,
      userId: user?.userId || body.userId,
    });

    if (!isDatabaseConfigured()) {
      const saved = memoryStore.create(prepared);
      return NextResponse.json(
        { message: "Resume saved successfully (Local Mode)", resume: saved },
        { status: 201 }
      );
    }

    await connectDB();

    const doc = await Resume.create(prepared);
    const normalized = normalizeResume(doc.toObject ? doc.toObject() : doc);

    return NextResponse.json(
      { message: "Resume saved successfully", resume: normalized },
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

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!isDatabaseConfigured()) {
      const resumes = memoryStore.getAll(user?.userId);
      return NextResponse.json(resumes);
    }

    await connectDB();

    const query = user?.userId
      ? { $or: [{ userId: user.userId }, { userId: { $exists: false } }] }
      : {};

    const docs = await Resume.find(query).sort({ updatedAt: -1, createdAt: -1 }).limit(50);
    const resumes = docs.map((d) => normalizeResume(d.toObject ? d.toObject() : d));

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("FETCH_RESUME_ERROR:", error);

    // If MongoDB error occurred, fallback to memoryStore
    const user = await getSessionUser(request).catch(() => null);
    const fallback = memoryStore.getAll(user?.userId);
    return NextResponse.json(fallback);
  }
}