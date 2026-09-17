"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResumeData,
  TemplateId,
  ResumeCustomization,
  PersonalInfo,
} from "@/src/types/resume";
import SectionNavigation, { SectionTabId } from "./SectionNavigation";
import SectionPersonalInfo from "./SectionPersonalInfo";
import SectionSummary from "./SectionSummary";
import SectionExperience from "./SectionExperience";
import SectionEducation from "./SectionEducation";
import SectionProjects from "./SectionProjects";
import SectionSkills from "./SectionSkills";
import SectionCertifications from "./SectionCertifications";
import SectionAchievements from "./SectionAchievements";
import SectionLanguages from "./SectionLanguages";
import SectionPublications from "./SectionPublications";
import SectionVolunteer from "./SectionVolunteer";
import SectionCoursework from "./SectionCoursework";
import SectionCustom from "./SectionCustom";
import SectionReorder from "./SectionReorder";
import CompletenessMeter from "./CompletenessMeter";
import CustomizationDrawer from "./CustomizationDrawer";
import AtsCheckerModal from "./AtsCheckerModal";
import JobTailorModal from "./JobTailorModal";
import TemplateRenderer from "../templates/TemplateRenderer";
import { downloadResumePDF, printResume } from "@/src/lib/pdf-generator";
import { downloadResumeDOCX } from "@/src/lib/docx-generator";
import { auditResumeForAts } from "@/src/lib/ats-checker";
import { generateId } from "@/src/lib/resume-normalizer";
import {
  ArrowLeft,
  Download,
  Printer,
  Copy,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Eye,
  Edit3,
  ShieldCheck,
  Target,
  FileDown,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface ResumeEditorProps {
  initialData: ResumeData;
  isNew?: boolean;
}

export default function ResumeEditor({ initialData, isNew = false }: ResumeEditorProps) {
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState<SectionTabId>("personalInfo");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isJobTailorModalOpen, setIsJobTailorModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Track if modified for auto-save
  const isFirstRender = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic ATS audit calculation
  const atsScore = useMemo(() => auditResumeForAts(data).score, [data]);

  // Format time
  useEffect(() => {
    const now = new Date();
    setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  // Deterministic Precedence Hydration:
  // 1. Server/database resume (initialData when not isDraftFallback)
  // 2. Explicit unsaved local draft (only if newer than server or when isDraftFallback)
  // 3. Temporary import cache (only when isDraftFallback)
  // 4. Clean blank state
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const currentId = initialData._id || initialData.id;

      // RULE 1: Server/database resume is canonical source of truth
      if (!initialData.isDraftFallback && currentId) {
        // Clear any temporary import staging so it cannot contaminate subsequent views
        sessionStorage.removeItem("pending_import_resume");
        localStorage.removeItem("pending_import_resume");

        // Check if there is an unsaved local draft that is STRICTLY newer than the database record
        const localDraftRaw = localStorage.getItem(`resume_draft_${currentId}`);
        if (localDraftRaw) {
          try {
            const localDraft = JSON.parse(localDraftRaw);
            if (
              localDraft?.updatedAt &&
              initialData.updatedAt &&
              new Date(localDraft.updatedAt).getTime() > new Date(initialData.updatedAt).getTime() + 2000
            ) {
              // Local draft has more recent unsaved changes
              setData(localDraft);
              return;
            }
          } catch {}
        }
        // Canonical database record takes precedence
        return;
      }

      // RULE 2 & 3: If server returned a draft fallback (e.g. offline or new draft)
      if (initialData.isDraftFallback && currentId) {
        // Priority 2: Check for explicit local draft matching this specific ID
        const localDraftRaw = localStorage.getItem(`resume_draft_${currentId}`);
        if (localDraftRaw) {
          try {
            const localDraft = JSON.parse(localDraftRaw);
            if (
              localDraft &&
              (localDraft.personalInfo?.fullName ||
                (localDraft.experience && localDraft.experience.length > 0) ||
                (localDraft.education && localDraft.education.length > 0) ||
                (localDraft.skills && localDraft.skills.length > 0))
            ) {
              setData(localDraft);
              return;
            }
          } catch {}
        }

        // Priority 3: Check temporary import staging cache
        const pendingImportRaw =
          sessionStorage.getItem("pending_import_resume") ||
          localStorage.getItem("pending_import_resume");

        if (pendingImportRaw) {
          try {
            const parsed = JSON.parse(pendingImportRaw);
            if (
              parsed &&
              (parsed.personalInfo?.fullName ||
                (parsed.experience && parsed.experience.length > 0) ||
                (parsed.education && parsed.education.length > 0) ||
                (parsed.skills && parsed.skills.length > 0))
            ) {
              const restored: ResumeData = {
                ...parsed,
                _id: currentId,
                id: currentId,
                isDraftFallback: false,
              };
              setData(restored);
              sessionStorage.removeItem("pending_import_resume");
              localStorage.removeItem("pending_import_resume");
              localStorage.setItem(`resume_draft_${currentId}`, JSON.stringify(restored));
              return;
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Hydration precedence check error:", err);
    }
  }, [initialData]);

  // Save to DB and localStorage
  const performSave = useCallback(
    async (currentData: ResumeData) => {
      setSaveStatus("saving");

      // Local draft backup
      try {
        const storageKey = `resume_draft_${currentData._id || currentData.id || "temp"}`;
        localStorage.setItem(storageKey, JSON.stringify(currentData));
      } catch (e) {
        console.warn("LocalStorage save error:", e);
      }

      try {
        const resumeId = currentData._id || currentData.id;
        let url = "/api/resumes";
        let method = "POST";

        if (resumeId && !isNew) {
          url = `/api/resumes/${resumeId}`;
          method = "PUT";
        }

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentData),
        });

        if (res.ok) {
          const result = await res.json();
          if (isNew && result.resume?._id) {
            router.replace(`/editor/${result.resume._id}`);
          }
          setSaveStatus("saved");
          const now = new Date();
          setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus("saved"); // Keep silent local draft
      }
    },
    [isNew, router]
  );

  // Debounced auto-save on state change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus("saving");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(data);
    }, 1200);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, performSave]);

  // Handlers
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleUpdateCustomization = (newSettings: Partial<ResumeCustomization>) => {
    setData((prev) => ({
      ...prev,
      customization: { ...prev.customization, ...newSettings },
    }));
  };

  const handleSelectTemplate = (templateId: TemplateId) => {
    setData((prev) => ({
      ...prev,
      template: templateId,
    }));
  };

  const handleToggleAtsMode = (enabled: boolean) => {
    setData((prev) => ({
      ...prev,
      isAtsMode: enabled,
    }));
  };

  const handleAddSkillFromJobTailor = (skillName: string) => {
    setData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: generateId(),
          name: skillName,
          category: "Technical",
          level: "Intermediate",
        },
      ],
    }));
  };

  const handleApplyTailoredResume = (tailoredData: ResumeData) => {
    setData(tailoredData);
    performSave(tailoredData);
  };

  const handleForkTailoredResume = async (forkedData: ResumeData) => {
    const forkId = `tailored_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const preparedFork: ResumeData = {
      ...forkedData,
      _id: forkId,
      id: forkId,
      baseResumeId: data._id || data.id,
    };

    try {
      localStorage.setItem(`resume_draft_${forkId}`, JSON.stringify(preparedFork));
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedFork),
      });
      if (res.ok) {
        const result = await res.json();
        const savedId = result.resume?._id || result.resume?.id || forkId;
        router.push(`/editor/${savedId}`);
        return;
      }
    } catch (e) {
      console.warn("Fork API save failed, opening local draft:", e);
    }
    router.push(`/editor/${forkId}`);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const filename = `${data.personalInfo.fullName || "Resume"}_Resume`.replace(/\s+/g, "_");
    await downloadResumePDF("resume-preview", filename);
    setIsDownloading(false);
  };

  const handleDownloadDOCX = async () => {
    setIsDownloadingDocx(true);
    try {
      await downloadResumeDOCX(data);
    } catch (err) {
      console.error("DOCX export error:", err);
      alert("Failed to export Word document. Please try again.");
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleDuplicate = async () => {
    const resumeId = data._id || data.id;
    if (!resumeId) return;

    setIsDuplicating(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/duplicate`, { method: "POST" });
      const result = await res.json();
      if (res.ok && result.resume?._id) {
        router.push(`/editor/${result.resume._id}`);
      } else {
        alert("Failed to duplicate resume");
      }
    } catch {
      alert("Error duplicating resume");
    } finally {
      setIsDuplicating(false);
    }
  };

  const counts = {
    personalInfo: data.personalInfo.fullName ? 1 : 0,
    summary: data.summary ? 1 : 0,
    experience: data.experience.length,
    education: data.education.length,
    projects: data.projects.length,
    skills: data.skills.length,
    certifications: data.certifications.length,
    achievements: (data.achievements || []).length,
    languages: data.languages.length,
    publications: (data.publications || []).length,
    volunteer: (data.volunteer || []).length,
    coursework: (data.coursework || []).length,
    customSections: data.customSections.length,
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Editable Title */}
          <div className="flex items-center gap-2 group">
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition py-0.5 px-1 max-w-[200px] sm:max-w-xs"
              placeholder="Resume Title"
            />
            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
          </div>

          {/* Auto-Save Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-200">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1 text-blue-600 font-medium animate-pulse">
                <Clock className="w-3.5 h-3.5" /> Saving...
              </span>
            ) : saveStatus === "saved" ? (
              <span className="flex items-center gap-1 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Saved {lastSavedTime ? `at ${lastSavedTime}` : ""}
              </span>
            ) : (
              <span className="text-red-500 font-medium">Auto-save error</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Edit / Preview Toggle */}
          <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileView("edit")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                mobileView === "edit" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMobileView("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                mobileView === "preview" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          {/* ATS Audit Score Button */}
          <button
            type="button"
            onClick={() => setIsAtsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
            title="Run ATS Compliance Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">ATS Score:</span>
            <span
              className={`font-bold ${
                atsScore >= 80 ? "text-emerald-700" : atsScore >= 60 ? "text-blue-700" : "text-amber-700"
              }`}
            >
              {atsScore}%
            </span>
          </button>

          {/* Job Tailor Button */}
          <button
            type="button"
            onClick={() => setIsJobTailorModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            title="Tailor resume to a job description"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tailor Job</span>
          </button>

          {/* Strict ATS Mode Toggle */}
          <button
            type="button"
            onClick={() => handleToggleAtsMode(!data.isAtsMode)}
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              data.isAtsMode
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="Toggle strict ATS single-column mode"
          >
            {data.isAtsMode ? (
              <ToggleRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
            <span>ATS Mode</span>
          </button>

          {/* Customize Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Templates & Style</span>
          </button>

          {/* Duplicate Resume */}
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicating || isNew}
            className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition disabled:opacity-40"
            title="Duplicate Resume"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={printResume}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition"
            title="Direct Print"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Download DOCX */}
          <button
            type="button"
            onClick={handleDownloadDOCX}
            disabled={isDownloadingDocx}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition disabled:opacity-50"
            title="Export native Microsoft Word (.docx)"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>{isDownloadingDocx ? "..." : "DOCX"}</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? "..." : "PDF"}</span>
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Editor Panels */}
        <div
          className={`w-full lg:w-1/2 flex flex-col bg-white border-r border-slate-200 ${
            mobileView === "edit" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Section Tabs Navigation */}
          <SectionNavigation
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            counts={counts}
          />

          {/* Completeness Meter */}
          <CompletenessMeter data={data} />

          {/* Tab Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "personalInfo" && (
              <SectionPersonalInfo
                data={data.personalInfo}
                onChange={handlePersonalInfoChange}
              />
            )}

            {activeTab === "summary" && (
              <SectionSummary
                summary={data.summary}
                onChange={(summary) => setData({ ...data, summary })}
              />
            )}

            {activeTab === "experience" && (
              <SectionExperience
                items={data.experience}
                onChange={(experience) => setData({ ...data, experience })}
              />
            )}

            {activeTab === "education" && (
              <SectionEducation
                items={data.education}
                onChange={(education) => setData({ ...data, education })}
              />
            )}

            {activeTab === "projects" && (
              <SectionProjects
                items={data.projects}
                onChange={(projects) => setData({ ...data, projects })}
              />
            )}

            {activeTab === "skills" && (
              <SectionSkills
                skills={data.skills}
                onChange={(skills) => setData({ ...data, skills })}
              />
            )}

            {activeTab === "certifications" && (
              <SectionCertifications
                items={data.certifications}
                onChange={(certifications) => setData({ ...data, certifications })}
              />
            )}

            {activeTab === "achievements" && (
              <SectionAchievements
                items={data.achievements || []}
                onChange={(achievements) => setData({ ...data, achievements })}
              />
            )}

            {activeTab === "languages" && (
              <SectionLanguages
                items={data.languages}
                onChange={(languages) => setData({ ...data, languages })}
              />
            )}

            {activeTab === "publications" && (
              <SectionPublications
                items={data.publications || []}
                onChange={(publications) => setData({ ...data, publications })}
              />
            )}

            {activeTab === "volunteer" && (
              <SectionVolunteer
                items={data.volunteer || []}
                onChange={(volunteer) => setData({ ...data, volunteer })}
              />
            )}

            {activeTab === "coursework" && (
              <SectionCoursework
                items={data.coursework || []}
                onChange={(coursework) => setData({ ...data, coursework })}
              />
            )}

            {activeTab === "customSections" && (
              <SectionCustom
                sections={data.customSections}
                onChange={(customSections) => setData({ ...data, customSections })}
              />
            )}

            {activeTab === "reorder" && (
              <SectionReorder
                sectionOrder={data.sectionOrder}
                onChange={(sectionOrder) => setData({ ...data, sectionOrder })}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div
          className={`w-full lg:w-1/2 flex flex-col bg-slate-200/70 ${
            mobileView === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Preview Toolbar */}
          <div className="p-2.5 px-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Live Preview</span>
              {data.isAtsMode ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  <ShieldCheck className="w-3 h-3" />
                  Strict ATS Single-Column
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 font-medium text-[10px]">
                  <Sparkles className="w-2.5 h-2.5" />
                  Live Reactive Renderer
                </span>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                className="p-1 hover:bg-slate-200 rounded"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
                className="p-1 hover:bg-slate-200 rounded"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.85)}
                className="p-1 hover:bg-slate-200 rounded text-[11px] font-medium ml-1"
                title="Fit to Screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Render Area */}
          <div
            id="resume-preview-container"
            className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start"
          >
            <div
              id="resume-preview"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
              }}
              className="origin-top max-w-full"
            >
              <TemplateRenderer data={data} />
            </div>
          </div>
        </div>
      </div>

      {/* Customization Drawer Modal */}
      <CustomizationDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        customization={data.customization}
        currentTemplate={data.template}
        onUpdateCustomization={handleUpdateCustomization}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* ATS Checker & Quality Audit Modal */}
      <AtsCheckerModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        data={data}
        onToggleAtsMode={handleToggleAtsMode}
      />

      {/* Job Description Tailor Modal */}
      <JobTailorModal
        isOpen={isJobTailorModalOpen}
        onClose={() => setIsJobTailorModalOpen(false)}
        data={data}
        onAddSkill={handleAddSkillFromJobTailor}
        onApplyTailored={handleApplyTailoredResume}
        onForkResume={handleForkTailoredResume}
      />
    </div>
  );
}
