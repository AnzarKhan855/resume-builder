import React from "react";
import { ResumeData } from "@/src/types/resume";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function calculateCompleteness(data: ResumeData): { score: number; suggestions: string[] } {
  let score = 0;
  const suggestions: string[] = [];

  // Personal info
  if (data.personalInfo.fullName) score += 15;
  else suggestions.push("Add your full name");

  if (data.personalInfo.email && data.personalInfo.phone) score += 15;
  else suggestions.push("Add email and phone number");

  if (data.personalInfo.linkedin || data.personalInfo.website) score += 5;
  else suggestions.push("Add LinkedIn or personal website link");

  // Summary
  if (data.summary && data.summary.length > 50) score += 15;
  else suggestions.push("Write a professional summary (at least 2 sentences)");

  // Experience
  if (data.experience && data.experience.length >= 2) score += 20;
  else if (data.experience && data.experience.length === 1) {
    score += 12;
    suggestions.push("Add at least 2 relevant work experiences");
  } else {
    suggestions.push("Add your work experience history");
  }

  // Education
  if (data.education && data.education.length >= 1) score += 10;
  else suggestions.push("Add your educational background");

  // Skills
  if (data.skills && data.skills.length >= 5) score += 15;
  else if (data.skills && data.skills.length > 0) {
    score += 8;
    suggestions.push("Add at least 5 key skills for ATS keyword matching");
  } else {
    suggestions.push("List your technical and soft skills");
  }

  // Projects or Certifications
  if ((data.projects && data.projects.length > 0) || (data.certifications && data.certifications.length > 0)) {
    score += 5;
  }

  return { score: Math.min(score, 100), suggestions };
}

export default function CompletenessMeter({ data }: { data: ResumeData }) {
  const { score, suggestions } = calculateCompleteness(data);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Resume Completeness
          </span>
          {score >= 80 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Ready to Apply
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" /> In Progress
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-slate-800">{score}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-blue-500" : "bg-amber-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Quick Suggestion Tip */}
      {suggestions.length > 0 && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-semibold text-slate-700">Suggestion:</span>
          <span>{suggestions[0]}</span>
        </p>
      )}
    </div>
  );
}
