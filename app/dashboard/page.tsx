"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { ResumeData } from "@/src/types/resume";
import ResumeUploadModal from "@/src/components/import/ResumeUploadModal";
import ImportReviewModal from "@/src/components/import/ImportReviewModal";
import {
  Plus,
  UploadCloud,
  FileText,
  Search,
  MoreVertical,
  Copy,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  ExternalLink,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [parsedImportData, setParsedImportData] = useState<ResumeData | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.name || "Candidate";

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume? This cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => (r._id || r.id) !== id));
      } else {
        alert("Failed to delete resume");
      }
    } catch (err) {
      alert("Error deleting resume");
    } finally {
      setDeletingId(null);
      setActiveMenuId(null);
    }
  };

  const handleDuplicateResume = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        if (result.resume) {
          setResumes((prev) => [result.resume, ...prev]);
        }
      } else {
        alert("Failed to duplicate resume");
      }
    } catch (err) {
      alert("Error duplicating resume");
    } finally {
      setActiveMenuId(null);
    }
  };

  // Called when upload succeeds and parsed data is ready
  const handleUploadSuccess = (data: ResumeData) => {
    setIsUploadModalOpen(false);
    setParsedImportData(data);
  };

  // Called when user finishes reviewing imported data
  const handleImportConfirmed = async (finalData: ResumeData) => {
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        const result = await res.json();
        const savedId = result.resume?._id || result.resume?.id;
        if (savedId) {
          router.push(`/editor/${savedId}`);
        } else {
          router.push("/editor/new");
        }
      }
    } catch (e) {
      console.error("Save imported error:", e);
      router.push("/editor/new");
    }
  };

  const filteredResumes = resumes.filter((r) => {
    const title = (r.title || "").toLowerCase();
    const name = (r.personalInfo?.fullName || r.name || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || name.includes(q);
  });

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-black text-slate-900 text-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
              RB
            </div>
            <span>ResumeForge</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 ml-1">
              V2
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-semibold">{displayName}</span>
          </div>

          <button
            onClick={() => logout()}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        {/* Welcome Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-1.5 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Resume Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Let&apos;s build something great. Create, tailor, and optimize resumes for every application.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              Import Resume
            </button>
            <Link
              href="/editor/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Create New Resume
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resumes by title or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2 w-full sm:w-auto justify-end">
            <span>
              Showing <strong>{filteredResumes.length}</strong> of {resumes.length} resumes
            </span>
          </div>
        </div>

        {/* Resumes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse h-64 flex flex-col justify-between"
              >
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="h-28 bg-slate-100 rounded-xl mb-4" />
                <div className="h-8 bg-slate-200 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No resumes yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Create your first resume from scratch with our step-by-step editor, or import an existing PDF or DOCX file to get started instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/editor/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Create Resume
              </Link>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
              >
                <UploadCloud className="w-4 h-4 text-blue-600" />
                Import Existing Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => {
              const resumeId = resume._id || resume.id || "";
              const candidateName = resume.personalInfo?.fullName || resume.name || "Candidate";
              const candidateRole = resume.personalInfo?.jobTitle || "Professional";

              return (
                <div
                  key={resumeId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                >
                  {/* Thumbnail Preview Area */}
                  <Link
                    href={`/editor/${resumeId}`}
                    className="h-44 bg-slate-100 p-4 relative overflow-hidden flex flex-col border-b border-slate-100 group-hover:bg-slate-200/50 transition cursor-pointer"
                  >
                    {/* Simulated miniature resume paper */}
                    <div className="w-full h-full bg-white shadow-xs rounded-lg p-3 text-[9px] text-slate-400 overflow-hidden flex flex-col justify-between pointer-events-none">
                      <div>
                        <div className="font-bold text-slate-900 text-[11px] truncate">
                          {candidateName}
                        </div>
                        <div className="text-slate-500 text-[9px] truncate mb-2">
                          {candidateRole}
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded mb-1" />
                        <div className="w-4/5 h-1 bg-slate-100 rounded mb-1" />
                        <div className="w-3/4 h-1 bg-slate-100 rounded mb-2" />
                        <div className="w-full h-0.5 bg-blue-100 rounded mb-1" />
                        <div className="w-5/6 h-1 bg-slate-100 rounded" />
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>{resume.experience?.length || 0} Experiences</span>
                        <span>{resume.skills?.length || 0} Skills</span>
                      </div>
                    </div>

                    {/* Template Badge */}
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-slate-700 shadow-xs uppercase tracking-wider">
                      {resume.template || "Classic"}
                    </span>
                  </Link>

                  {/* Card Info & Actions */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition truncate">
                          <Link href={`/editor/${resumeId}`}>
                            {resume.title || "Untitled Resume"}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Updated {formatRelativeTime(resume.updatedAt)}
                        </p>
                      </div>

                      {/* Options Dropdown Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === resumeId ? null : resumeId)
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === resumeId && (
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30 animate-fade-in text-xs">
                            <button
                              type="button"
                              onClick={() => handleDuplicateResume(resumeId)}
                              className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteResume(resumeId)}
                              disabled={deletingId === resumeId}
                              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Primary Card Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-3">
                      <Link
                        href={`/editor/${resumeId}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Resume
                      </Link>
                      <Link
                        href={`/editor/${resumeId}`}
                        className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                        title="Open in Editor"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Import Review Modal */}
      {parsedImportData && (
        <ImportReviewModal
          isOpen={Boolean(parsedImportData)}
          initialData={parsedImportData}
          onClose={() => setParsedImportData(null)}
          onConfirm={handleImportConfirmed}
        />
      )}
    </div>
  );
}
