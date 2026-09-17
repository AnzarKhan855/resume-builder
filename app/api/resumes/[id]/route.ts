import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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
      if (resume.userId && user?.userId && resume.userId !== user.userId) {
        return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
      }
      return NextResponse.json(resume);
    }

    if (!mongoose.isValidObjectId(id)) {
      const fallback = memoryStore.getById(id);
      if (fallback) {
        if (fallback.userId && user?.userId && fallback.userId !== user.userId) {
          return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
        }
        return NextResponse.json(fallback);
      }
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    await connectDB();

    const doc = await Resume.findById(id);
    if (!doc) {
      const fallback = memoryStore.getById(id);
      if (fallback) {
        if (fallback.userId && user?.userId && fallback.userId !== user.userId) {
          return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
        }
        return NextResponse.json(fallback);
      }
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    const resume = normalizeResume(doc.toObject ? doc.toObject() : doc);

    // User Isolation: If resume is owned by an account, block other users
    if (resume.userId) {
      if (!user) {
        return NextResponse.json({ message: "Unauthorized: Please sign in to view this resume" }, { status: 401 });
      }
      if (resume.userId !== user.userId) {
        return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
      }
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

    const candidateUserId = user?.userId || body.userId;
    const cleanUserId =
      candidateUserId && mongoose.isValidObjectId(candidateUserId) ? candidateUserId : undefined;

    const prepared = prepareResumeForSave({
      ...body,
      userId: cleanUserId,
    });

    if (!isDatabaseConfigured()) {
      const existing = memoryStore.getById(id);
      if (existing?.userId && user?.userId && existing.userId !== user.userId) {
        return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
      }
      const updated = memoryStore.update(id, prepared);
      if (!updated) {
        const created = memoryStore.create({ ...prepared, _id: id, id });
        return NextResponse.json({ message: "Resume updated", resume: created });
      }
      return NextResponse.json({ message: "Resume updated", resume: updated });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid resume ID format" }, { status: 400 });
    }

    await connectDB();

    const existing = await Resume.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    // User Isolation: Only the owner can update the resume
    if (existing.userId) {
      if (!user || existing.userId.toString() !== user.userId) {
        return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
      }
    }

    const toUpdate: any = { ...prepared };
    delete toUpdate._id;
    delete toUpdate.id;
    if (!toUpdate.userId) {
      delete toUpdate.userId;
    }

    const updatedDoc = await Resume.findByIdAndUpdate(id, toUpdate, {
      new: true,
      runValidators: false,
    });

    if (!updatedDoc) {
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
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

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid resume ID format" }, { status: 400 });
    }

    await connectDB();
    const existing = await Resume.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    if (existing.userId) {
      if (!user || existing.userId.toString() !== user.userId) {
        return NextResponse.json({ message: "Forbidden: You do not own this resume" }, { status: 403 });
      }
    }

    await Resume.findByIdAndDelete(id);
    memoryStore.delete(id);

    return NextResponse.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("DELETE_RESUME_ERROR:", error);
    return NextResponse.json({ message: "Failed to delete resume" }, { status: 500 });
  }
}
