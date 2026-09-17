import React from "react";
import ResumeEditor from "@/src/components/editor/ResumeEditor";
import { INITIAL_RESUME_DATA } from "@/src/types/resume";

export const metadata = {
  title: "Create Resume | Resume Builder V2",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewResumePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const initialData = template
    ? { ...INITIAL_RESUME_DATA, template }
    : INITIAL_RESUME_DATA;

  return <ResumeEditor initialData={initialData} isNew={true} />;
}
