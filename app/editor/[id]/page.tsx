import React from "react";
import ResumeEditor from "@/src/components/editor/ResumeEditor";
import { normalizeResume } from "@/src/lib/resume-normalizer";
import { memoryStore } from "@/src/lib/memory-store";
import { connectDB, isDatabaseConfigured } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
import { INITIAL_RESUME_DATA } from "@/src/types/resume";

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
  let resumeData = null;

  try {
    if (isDatabaseConfigured()) {
      await connectDB();
      const doc = await Resume.findById(id);
      if (doc) {
        resumeData = normalizeResume(doc.toObject ? doc.toObject() : doc);
      }
    }
  } catch (err) {
    console.warn("DB load in EditorPage failed:", err);
  }

  if (!resumeData) {
    const memoryDoc = memoryStore.getById(id);
    if (memoryDoc) {
      resumeData = memoryDoc;
    } else {
      resumeData = { ...INITIAL_RESUME_DATA, _id: id, id };
    }
  }

  return <ResumeEditor initialData={resumeData} />;
}
