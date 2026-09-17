import React from "react";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import ResumeEditor from "@/src/components/editor/ResumeEditor";
import { normalizeResume } from "@/src/lib/resume-normalizer";
import { memoryStore } from "@/src/lib/memory-store";
import { connectDB, isDatabaseConfigured } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
import { INITIAL_RESUME_DATA } from "@/src/types/resume";
import { getSessionUser } from "@/src/lib/auth";

export const metadata = {
  title: "Edit Resume | Resume Builder V2",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  let resumeData = null;

  try {
    if (isDatabaseConfigured()) {
      if (mongoose.isValidObjectId(id)) {
        await connectDB();
        const doc = await Resume.findById(id);
        if (doc) {
          const normalized = normalizeResume(doc.toObject ? doc.toObject() : doc);
          // User Isolation: If owned by another user, redirect away
          if (normalized.userId && user?.userId && normalized.userId !== user.userId) {
            redirect("/dashboard");
          }
          resumeData = { ...normalized, isDraftFallback: false };
        }
      }
    }
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) {
      throw err; // Allow Next.js navigation redirect to propagate
    }
    console.warn("DB load in EditorPage failed:", err);
  }

  if (!resumeData) {
    const memoryDoc = memoryStore.getById(id);
    if (memoryDoc) {
      if (memoryDoc.userId && user?.userId && memoryDoc.userId !== user.userId) {
        redirect("/dashboard");
      }
      resumeData = { ...memoryDoc, isDraftFallback: false };
    } else {
      resumeData = { ...INITIAL_RESUME_DATA, _id: id, id, isDraftFallback: true };
    }
  }

  return <ResumeEditor initialData={resumeData} />;
}
