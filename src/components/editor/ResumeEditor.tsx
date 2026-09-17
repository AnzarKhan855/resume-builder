"use client";

import React, { useState, useEffect, useRef } from "react";
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
import SectionLanguages from "./SectionLanguages";
import SectionCustom from "./SectionCustom";
import SectionReorder from "./SectionReorder";
import CompletenessMeter from "./CompletenessMeter";
import CustomizationDrawer from "./CustomizationDrawer";
import TemplateRenderer, { AVAILABLE_TEMPLATES } from "../templates/TemplateRenderer";
import { downloadResumePDF, printResume } from "@/src/lib/pdf-generator";
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Track if modified for auto-save
  const isFirstRender = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format time
  useEffect(() => {
    const now = new Date();
    setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  // Save to DB and localStorage
  const performSave = async (currentData: ResumeData) => {
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
          // Redirect to the assigned ID
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
  };

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
  }, [data]);

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

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const filename = `${data.personalInfo.fullName || "Resume"}_Resume`.replace(/\s+/g, "_");
    await downloadResumePDF("resume-preview", filename);
    setIsDownloading(false);
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
    } catch (err) {
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
    languages: data.languages.length,
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
              className="text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition py-0.5 px-1 max-w-[220px] sm:max-w-xs"
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

          {/* Template Quick Switcher */}
          <select
            value={data.template}
            onChange={(e) => handleSelectTemplate(e.target.value as TemplateId)}
            className="hidden sm:block text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 transition"
          >
            {AVAILABLE_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                Template: {t.name}
              </option>
            ))}
          </select>

          {/* Customize Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize</span>
          </button>

          {/* Duplicate Resume */}
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicating || isNew}
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition disabled:opacity-40"
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

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Section Editor */}
        <div
          className={`w-full lg:w-1/2 flex flex-col border-r border-slate-200 bg-white ${
            mobileView === "edit" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Section Navigation Tabs */}
          <SectionNavigation activeTab={activeTab} onSelectTab={setActiveTab} counts={counts} />

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <CompletenessMeter data={data} />

            {activeTab === "personalInfo" && (
              <SectionPersonalInfo data={data.personalInfo} onChange={handlePersonalInfoChange} />
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

            {activeTab === "languages" && (
              <SectionLanguages
                items={data.languages}
                onChange={(languages) => setData({ ...data, languages })}
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 font-medium text-[10px]">
                <Sparkles className="w-2.5 h-2.5" />
                ATS-Optimized Structure
              </span>
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
              className="origin-top"
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
    </div>
  );
}
