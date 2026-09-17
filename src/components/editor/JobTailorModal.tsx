"use client";

import React, { useState, useRef } from "react";
import { ResumeData } from "@/src/types/resume";
import {
  X,
  Target,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sparkles,
  UploadCloud,
  FileText,
  ArrowRight,
  Check,
  GitFork,
  CheckCheck,
  ShieldCheck,
} from "lucide-react";

interface JobTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  onAddSkill: (skillName: string) => void;
  onApplyTailored?: (tailoredData: ResumeData) => void;
  onForkResume?: (forkedData: ResumeData) => void;
}

interface BulletDiff {
  id: string;
  company: string;
  position: string;
  original: string;
  tailored: string;
  reason: string;
  accepted?: boolean;
}

interface TailorAnalysis {
  targetRole: string;
  seniority: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  jobKeywords: string[];
}

export default function JobTailorModal({
  isOpen,
  onClose,
  data,
  onAddSkill,
  onApplyTailored,
  onForkResume,
}: JobTailorModalProps) {
  const [activeTab, setActiveTab] = useState<"input" | "analysis" | "review">("input");
  const [jobText, setJobText] = useState("");
  const [targetRole, setTargetRole] = useState(data.personalInfo?.jobTitle || "");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [analysis, setAnalysis] = useState<TailorAnalysis | null>(null);
  const [summaryDiff, setSummaryDiff] = useState<{
    original: string;
    tailored: string;
    reason: string;
    accepted: boolean;
  } | null>(null);
  const [bulletDiffs, setBulletDiffs] = useState<BulletDiff[]>([]);
  const [tailoredResumeData, setTailoredResumeData] = useState<ResumeData | null>(null);

  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file drop / upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setErrorMessage("");
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("resumeData", JSON.stringify(data));
      if (targetRole) formData.append("targetRole", targetRole);

      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to process job description file");
      }

      setAnalysis(result.analysis);
      setTargetRole(result.analysis.targetRole);
      setSummaryDiff({
        ...result.diffs.summary,
        accepted: true,
      });
      setBulletDiffs(
        result.diffs.bullets.map((b: any) => ({
          ...b,
          accepted: true,
        }))
      );
      setTailoredResumeData(result.tailoredResume);
      setActiveTab("analysis");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse job description file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle text-based tailoring
  const handleAnalyzeText = async () => {
    if (!jobText.trim() || jobText.length < 20) {
      setErrorMessage("Please paste a job description with at least 20 characters.");
      return;
    }

    setErrorMessage("");
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobText,
          resumeData: data,
          targetRole,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to analyze job description");
      }

      setAnalysis(result.analysis);
      setTargetRole(result.analysis.targetRole);
      setSummaryDiff({
        ...result.diffs.summary,
        accepted: true,
      });
      setBulletDiffs(
        result.diffs.bullets.map((b: any) => ({
          ...b,
          accepted: true,
        }))
      );
      setTailoredResumeData(result.tailoredResume);
      setActiveTab("analysis");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze job description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle accepted status for bullet
  const toggleBulletAccepted = (id: string) => {
    setBulletDiffs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, accepted: !b.accepted } : b))
    );
  };

  // Toggle all bullets
  const toggleAllBullets = (accept: boolean) => {
    setBulletDiffs((prev) => prev.map((b) => ({ ...b, accepted: accept })));
    if (summaryDiff) {
      setSummaryDiff({ ...summaryDiff, accepted: accept });
    }
  };

  // Apply changes to active resume
  const handleApply = () => {
    if (!tailoredResumeData) return;

    const finalSummary = summaryDiff?.accepted
      ? summaryDiff.tailored
      : data.summary;

    const finalExperience = data.experience.map((exp) => {
      const updatedHighlights = (exp.highlights || []).map((h) => {
        const diff = bulletDiffs.find((d) => d.original === h && d.accepted);
        return diff ? diff.tailored : h;
      });

      let updatedDesc = exp.description;
      const descDiff = bulletDiffs.find((d) => d.original === exp.description && d.accepted);
      if (descDiff) updatedDesc = descDiff.tailored;

      return {
        ...exp,
        description: updatedDesc,
        highlights: updatedHighlights,
      };
    });

    const finalResume: ResumeData = {
      ...tailoredResumeData,
      summary: finalSummary,
      experience: finalExperience,
    };

    if (onApplyTailored) {
      onApplyTailored(finalResume);
    }
    onClose();
  };

  // Fork and save as new tailored version
  const handleFork = () => {
    if (!tailoredResumeData) return;

    const finalSummary = summaryDiff?.accepted
      ? summaryDiff.tailored
      : data.summary;

    const finalExperience = data.experience.map((exp) => {
      const updatedHighlights = (exp.highlights || []).map((h) => {
        const diff = bulletDiffs.find((d) => d.original === h && d.accepted);
        return diff ? diff.tailored : h;
      });

      let updatedDesc = exp.description;
      const descDiff = bulletDiffs.find((d) => d.original === exp.description && d.accepted);
      if (descDiff) updatedDesc = descDiff.tailored;

      return {
        ...exp,
        description: updatedDesc,
        highlights: updatedHighlights,
      };
    });

    const finalResume: ResumeData = {
      ...tailoredResumeData,
      summary: finalSummary,
      experience: finalExperience,
      baseResumeId: data._id || data.id,
    };

    if (onForkResume) {
      onForkResume(finalResume);
    }
    onClose();
  };

  const handleAddMissingSkill = (skill: string) => {
    onAddSkill(skill);
    setAddedSkills((prev) => [...prev, skill]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Job Description Tailoring Studio</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  CAR / STAR Powered
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Align keywords, accomplishments, and summary to any job without false claims or hallucination.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("input")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === "input"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            1. Ingest Job Posting
          </button>
          <button
            type="button"
            onClick={() => analysis && setActiveTab("analysis")}
            disabled={!analysis}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === "analysis"
                ? "border-blue-600 text-blue-600"
                : !analysis
                ? "border-transparent text-slate-300 cursor-not-allowed"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            2. Match & Gap Analysis {analysis ? `(${analysis.matchScore}%)` : ""}
          </button>
          <button
            type="button"
            onClick={() => analysis && setActiveTab("review")}
            disabled={!analysis}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === "review"
                ? "border-blue-600 text-blue-600"
                : !analysis
                ? "border-transparent text-slate-300 cursor-not-allowed"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            3. Review Diffs & Optimize ({bulletDiffs.length} Bullets)
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto grow">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: INPUT */}
          {activeTab === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Role / Job Title
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer, Staff Data Scientist..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Job Description Document (PDF, DOCX, TXT)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                  <div>
                    <span className="text-xs font-semibold text-blue-600">Click to upload</span>{" "}
                    <span className="text-xs text-slate-500">or drag and drop job posting</span>
                  </div>
                  <p className="text-[11px] text-slate-400">PDF, DOCX or TXT files up to 5MB</p>
                  {uploadedFileName && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      {uploadedFileName}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Or Paste Text */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold">Or paste text</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Description Text
                </label>
                <textarea
                  rows={6}
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Paste the requirements, responsibilities, and qualifications from LinkedIn, Indeed, or the company career page..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAnalyzeText}
                  disabled={isAnalyzing || (!jobText.trim() && !uploadedFileName)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Analyzing & Tailoring...
                    </>
                  ) : (
                    <>
                      Analyze & Tailor Resume
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYSIS & GAP */}
          {activeTab === "analysis" && analysis && (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-blue-700 uppercase">
                    Target Role Match Rate
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {analysis.targetRole}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Seniority Level: <span className="font-semibold text-slate-800">{analysis.seniority}</span>
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white shadow-xs">
                    <span className="text-lg font-black text-blue-600">{analysis.matchScore}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">ATS Match</span>
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Matched Skills & Keywords ({analysis.matchedSkills.length})
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mb-2.5">
                  These high-priority job keywords were successfully verified in your resume:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matchedSkills.length === 0 ? (
                    <span className="text-xs text-slate-400">No exact keywords matched yet.</span>
                  ) : (
                    analysis.matchedSkills.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Missing / Unmentioned Keywords ({analysis.missingSkills.length})
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mb-2.5">
                  Add any skills you actually possess to improve your ATS match score:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingSkills.length === 0 ? (
                    <span className="text-xs text-emerald-600 font-medium">
                      All identified job keywords are already represented in your resume!
                    </span>
                  ) : (
                    analysis.missingSkills.map((kw) => {
                      const isAdded = addedSkills.includes(kw);
                      return (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => !isAdded && handleAddMissingSkill(kw)}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            isAdded
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-200"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              {kw}
                            </>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("input")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Edit Job Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("review")}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Review Tailored Changes ({bulletDiffs.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEW DIFFS */}
          {activeTab === "review" && (
            <div className="space-y-6">
              {/* Anti-Hallucination Guarantee Notice */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="font-semibold">Anti-Hallucination Guarantee:</span> All suggestions rephrase your genuine background in STAR format. Employers, dates, and metrics are preserved strictly.
                </div>
              </div>

              {/* Bulk actions */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Suggested Tailored Enhancements
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllBullets(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded bg-blue-50 border border-blue-200 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllBullets(false)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded bg-slate-100 cursor-pointer"
                  >
                    Reject All
                  </button>
                </div>
              </div>

              {/* Summary Diff */}
              {summaryDiff && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Professional Executive Summary
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSummaryDiff({
                          ...summaryDiff,
                          accepted: !summaryDiff.accepted,
                        })
                      }
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        summaryDiff.accepted
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {summaryDiff.accepted ? <Check className="w-3 h-3" /> : null}
                      {summaryDiff.accepted ? "Accepted" : "Reject / Keep Original"}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {summaryDiff.original && (
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600">
                        <span className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                          Original
                        </span>
                        {summaryDiff.original}
                      </div>
                    )}
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
                      <span className="block text-[10px] font-bold uppercase text-emerald-700 mb-0.5">
                        Tailored for {targetRole}
                      </span>
                      {summaryDiff.tailored}
                    </div>
                  </div>
                  {summaryDiff.reason && (
                    <p className="text-[11px] text-slate-500 italic">
                      💡 {summaryDiff.reason}
                    </p>
                  )}
                </div>
              )}

              {/* Bullet Diffs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Experience Bullets Optimized ({bulletDiffs.length})
                </h4>

                {bulletDiffs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No bullet modifications needed. Your bullets already align with the requirements!
                  </p>
                ) : (
                  bulletDiffs.map((diff) => (
                    <div
                      key={diff.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          {diff.company && (
                            <span className="text-xs font-semibold text-slate-800">
                              {diff.company} {diff.position ? `• ${diff.position}` : ""}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleBulletAccepted(diff.id)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            diff.accepted
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {diff.accepted ? <Check className="w-3 h-3" /> : null}
                          {diff.accepted ? "Accepted" : "Reject"}
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 line-through">
                          {diff.original}
                        </div>
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
                          {diff.tailored}
                        </div>
                      </div>
                      {diff.reason && (
                        <p className="text-[11px] text-slate-500 italic">
                          💡 {diff.reason}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          {activeTab === "review" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFork}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer"
                title="Saves this tailored resume as a new version, leaving your base resume untouched"
              >
                <GitFork className="w-3.5 h-3.5 text-blue-600" />
                Save as New Tailored Resume
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Apply to Current Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
