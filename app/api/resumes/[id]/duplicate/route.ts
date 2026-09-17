import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
import { normalizeResume, prepareResumeForSave } from "@/src/lib/resume-normalizer";
import { getSessionUser } from "@/src/lib/auth";
import { memoryStore } from "@/src/lib/memory-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(request);

    let originalData: any = null;

    if (!isDatabaseConfigured()) {
      originalData = memoryStore.getById(id);
    } else {
      await connectDB();
      const doc = await Resume.findById(id);
      if (doc) {
        originalData = doc.toObject ? doc.toObject() : doc;
      } else {
        originalData = memoryStore.getById(id);
      }
    }

    if (!originalData) {
      return NextResponse.json({ message: "Original resume not found" }, { status: 404 });
    }

    const normalized = normalizeResume(originalData);

    const duplicatePayload = {
      ...normalized,
      _id: undefined,
      id: undefined,
      title: `Copy of ${normalized.title || "Resume"}`,
      userId: user?.userId || normalized.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const prepared = prepareResumeForSave(duplicatePayload);

    if (!isDatabaseConfigured()) {
      const cloned = memoryStore.create(prepared);
      return NextResponse.json(
        { message: "Resume duplicated successfully", resume: cloned },
        { status: 201 }
      );
    }

    const newDoc = await Resume.create(prepared);
    const result = normalizeResume(newDoc.toObject ? newDoc.toObject() : newDoc);

    return NextResponse.json(
      { message: "Resume duplicated successfully", resume: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("DUPLICATE_RESUME_ERROR:", error);
    return NextResponse.json({ message: "Failed to duplicate resume" }, { status: 500 });
  }
}
