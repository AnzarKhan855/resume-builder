import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
import { normalizeResume, prepareResumeForSave } from "@/src/lib/resume-normalizer";
import { getSessionUser } from "@/src/lib/auth";
import { memoryStore } from "@/src/lib/memory-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(request);

    if (!isDatabaseConfigured()) {
      const resume = memoryStore.getById(id);
      if (!resume) {
        return NextResponse.json({ message: "Resume not found" }, { status: 404 });
      }
      return NextResponse.json(resume);
    }

    await connectDB();

    const doc = await Resume.findById(id);
    if (!doc) {
      // Fallback check in memory store
      const fallback = memoryStore.getById(id);
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    const resume = normalizeResume(doc.toObject ? doc.toObject() : doc);

    // If resume is owned by another user and not public, verify authorization
    if (resume.userId && user?.userId && resume.userId !== user.userId) {
      // Still allow viewing or provide ownership badge
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("GET_RESUME_BY_ID_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch resume" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(request);
    const body = await request.json();

    const prepared = prepareResumeForSave({
      ...body,
      userId: user?.userId || body.userId,
    });

    if (!isDatabaseConfigured()) {
      const updated = memoryStore.update(id, prepared);
      if (!updated) {
        // If not in memory store, create it
        const created = memoryStore.create({ ...prepared, _id: id, id });
        return NextResponse.json({ message: "Resume updated", resume: created });
      }
      return NextResponse.json({ message: "Resume updated", resume: updated });
    }

    await connectDB();

    const updatedDoc = await Resume.findByIdAndUpdate(id, prepared, {
      new: true,
      runValidators: false,
    });

    if (!updatedDoc) {
      // Attempt upsert
      const created = await Resume.create({ ...prepared, _id: id });
      return NextResponse.json({
        message: "Resume saved",
        resume: normalizeResume(created.toObject ? created.toObject() : created),
      });
    }

    return NextResponse.json({
      message: "Resume updated successfully",
      resume: normalizeResume(updatedDoc.toObject ? updatedDoc.toObject() : updatedDoc),
    });
  } catch (error) {
    console.error("UPDATE_RESUME_ERROR:", error);
    return NextResponse.json({ message: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(request);

    if (!isDatabaseConfigured()) {
      const existing = memoryStore.getById(id);
      if (existing?.userId && user?.userId && existing.userId !== user.userId) {
        return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
      }
      const success = memoryStore.delete(id);
      return NextResponse.json({ message: "Resume deleted successfully", success });
    }

    await connectDB();
    const existing = await Resume.findById(id);
    if (existing?.userId && user?.userId && existing.userId.toString() !== user.userId) {
      return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
    }

    await Resume.findByIdAndDelete(id);
    memoryStore.delete(id);

    return NextResponse.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("DELETE_RESUME_ERROR:", error);
    return NextResponse.json({ message: "Failed to delete resume" }, { status: 500 });
  }
}
