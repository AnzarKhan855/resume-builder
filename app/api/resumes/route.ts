import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB, isDatabaseConfigured } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
import { normalizeResume, prepareResumeForSave } from "@/src/lib/resume-normalizer";
import { getSessionUser } from "@/src/lib/auth";
import { memoryStore } from "@/src/lib/memory-store";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    const body = await request.json();

    // Sanitize _id: strip client-side temporary IDs (e.g. import_*) so MongoDB generates a genuine 24-char ObjectId
    const cleanId = body._id && mongoose.isValidObjectId(body._id) ? body._id : undefined;

    // Sanitize userId: must be a valid ObjectId for MongoDB reference
    const candidateUserId = user?.userId || body.userId;
    const cleanUserId =
      candidateUserId && mongoose.isValidObjectId(candidateUserId) ? candidateUserId : undefined;

    const prepared = prepareResumeForSave({
      ...body,
      _id: cleanId,
      id: cleanId,
      userId: cleanUserId,
    });

    if (!isDatabaseConfigured()) {
      const saved = memoryStore.create(prepared);
      return NextResponse.json(
        {
          message: "Resume saved successfully (Local Mode)",
          resume: saved,
          resumeId: saved._id || saved.id,
        },
        { status: 201 }
      );
    }

    await connectDB();

    const toSave: any = { ...prepared };
    if (!toSave._id) {
      delete toSave._id;
      delete toSave.id;
    }
    if (!toSave.userId) {
      delete toSave.userId;
    }

    const doc = await Resume.create(toSave);
    const normalized = normalizeResume(doc.toObject ? doc.toObject() : doc);

    return NextResponse.json(
      {
        message: "Resume saved successfully",
        resume: normalized,
        resumeId: doc._id.toString(),
      },
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