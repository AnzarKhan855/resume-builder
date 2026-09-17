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

export default function NewResumePage() {
  return <ResumeEditor initialData={INITIAL_RESUME_DATA} isNew={true} />;
}
