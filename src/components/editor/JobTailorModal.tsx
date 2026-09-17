"use client";

import React, { useState, useMemo } from "react";
import { ResumeData } from "@/src/types/resume";
import {
  X,
  Target,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sparkles,
} from "lucide-react";

interface JobTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  onAddSkill: (skillName: string) => void;
}

const COMMON_TECH_KEYWORDS = [
  "react", "next.js", "vue", "angular", "typescript", "javascript", "python",
  "java", "c++", "c#", "go", "golang", "rust", "node.js", "express", "sql",
  "postgresql", "mongodb", "redis", "mysql", "snowflake", "graphql", "rest api",
  "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "terraform", "git",
  "linux", "microservices", "tailwind", "jest", "cypress", "playwright",
  "agile", "scrum", "jira", "tableau", "power bi", "machine learning", "pandas",
  "numpy", "pytorch", "tensorflow", "etl", "data modeling", "system design"
];

export default function JobTailorModal({
  isOpen,
  onClose,
  data,
  onAddSkill,
}: JobTailorModalProps) {
  const [jobText, setJobText] = useState("");
  const [addedSkills, setAddedSkills] = useState<string[]>([]);

  // Collect all text from current resume to match against
  const resumeKeywords = useMemo(() => {
    const raw = [
      data.personalInfo.jobTitle || "",
      data.summary || "",
      ...(data.skills || []).map((s) => s.name),
      ...(data.experience || []).map((e) => `${e.position} ${e.company} ${e.description} ${(e.highlights || []).join(" ")}`),
      ...(data.projects || []).map((p) => `${p.title} ${p.description} ${(p.technologies || []).join(" ")}`),
      ...(data.certifications || []).map((c) => c.name),
    ].join(" ").toLowerCase();

    return raw;
  }, [data]);

  // Extract keywords from job description
  const analysis = useMemo(() => {
    if (!jobText.trim()) return null;

    const lowerJob = jobText.toLowerCase();
    const foundInJob: string[] = [];

    // Check common tech keywords
    for (const kw of COMMON_TECH_KEYWORDS) {
      const regex = new RegExp(`\\b${kw.replace(".", "\\.")}\\b`, "i");
      if (regex.test(lowerJob)) {
        foundInJob.push(kw);
      }
    }

    // Also extract capitalized multi-word phrases or capitalized words in job posting
    const matches = jobText.match(/\b[A-Z][a-zA-Z0-9+#.-]{2,}\b/g) || [];
    const stopWords = new Set(["The", "And", "You", "We", "Our", "Will", "With", "For", "Are", "This", "That", "Have", "About", "Role", "Team", "Work", "Join", "Must", "Good", "Great", "Company"]);
    for (const m of matches) {
      const lower = m.toLowerCase();
      if (!stopWords.has(m) && !foundInJob.includes(lower) && m.length > 2) {
        if (COMMON_TECH_KEYWORDS.includes(lower)) {
          foundInJob.push(lower);
        }
      }
    }

    const matched: string[] = [];
    const missing: string[] = [];

    for (const kw of foundInJob) {
      const regex = new RegExp(`\\b${kw.replace(".", "\\.")}\\b`, "i");
      if (regex.test(resumeKeywords)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }

    const matchRate =
      foundInJob.length > 0
        ? Math.round((matched.length / foundInJob.length) * 100)
        : 100;

    return {
      totalFound: foundInJob.length,
      matched,
      missing,
      matchRate,
    };
  }, [jobText, resumeKeywords]);

  if (!isOpen) return null;

  const handleQuickAdd = (skill: string) => {
    onAddSkill(skill);
    setAddedSkills((prev) => [...prev, skill]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Job Description Tailor</h2>
              <p className="text-xs text-slate-500">
                Match your resume keywords against target job requirements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* Input Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Paste Target Job Posting / Requirements
            </label>
            <textarea
              rows={5}
              placeholder="Paste the job description from LinkedIn, Indeed, or Greenhouse here to compare required skills against your resume..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Analysis Results */}
          {analysis && analysis.totalFound > 0 ? (
            <div className="space-y-5">
              {/* Match Rate Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-600">Keyword Alignment Rate</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {analysis.matchRate}% Match
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">
                    <strong className="text-emerald-700">{analysis.matched.length} Matched</strong> •{" "}
                    <strong className="text-amber-700">{analysis.missing.length} Missing</strong>
                  </span>
                </div>
              </div>

              {/* Matched Skills */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Matched Keywords in Your Resume ({analysis.matched.length})
                </h3>
                {analysis.matched.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matched.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 capitalize"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No direct keyword matches found yet.</p>
                )}
              </div>

              {/* Missing Skills with 1-click Add */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Target Skills Missing From Resume ({analysis.missing.length})
                </h3>
                <p className="text-[11px] text-slate-500 mb-2">
                  If you have experience with any of these, click &quot;Add&quot; to instantly include them in your skills section:
                </p>
                {analysis.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missing.map((kw) => {
                      const isAdded = addedSkills.includes(kw);
                      return (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleQuickAdd(kw)}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            isAdded
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300"
                          }`}
                        >
                          <span className="capitalize">{kw}</span>
                          {isAdded ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Plus className="w-3 h-3 text-amber-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-semibold">
                    Outstanding! Your resume covers all detected job keywords.
                  </p>
                )}
              </div>

              {/* Strategic Advice */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/60 rounded-xl text-xs text-blue-950">
                <span className="font-bold flex items-center gap-1.5 mb-1 text-blue-900">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> ATS Tailoring Best Practice
                </span>
                We never recommend adding false experience. If you have legitimate exposure to the missing skills above, ensure they appear in your Professional Summary and at least one Work Experience bullet point.
              </div>
            </div>
          ) : jobText.trim() ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              Paste the full text of the job description to begin keyword extraction.
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            Done Tailoring
          </button>
        </div>
      </div>
    </div>
  );
}
