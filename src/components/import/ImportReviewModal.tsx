"use client";

import React, { useState } from "react";
import { ResumeData } from "@/src/types/resume";
import {
  X,
  Check,
  ArrowRight,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface ImportReviewModalProps {
  isOpen: boolean;
  initialData: ResumeData & { confidence?: any };
  onClose: () => void;
  onConfirm: (finalData: ResumeData) => void;
  onStartOver?: () => void;
}

export default function ImportReviewModal({
  isOpen,
  initialData,
  onClose,
  onConfirm,
  onStartOver,
}: ImportReviewModalProps) {
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState<
    "personal" | "experience" | "education" | "skills" | "projects" | "certifications"
  >("personal");
  const [newSkill, setNewSkill] = useState("");

  if (!isOpen) return null;

  const confidence = (initialData as any).confidence;
  const overallScore = confidence?.overall ?? 85;

  const handlePersonalInfoChange = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: generateId(), name: newSkill.trim(), category: "General" }],
    }));
    setNewSkill("");
  };

  const handleRemoveSkill = (id: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const renderConfidenceBadge = (fieldName: string, label?: string) => {
    const fieldConf = confidence?.fields?.[fieldName];
    const isHigh = fieldConf ? fieldConf.confidence === "high" : true;

    if (isHigh) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
          <Check className="w-3 h-3 text-emerald-600" />
          {label || "High Confidence"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        {label || "Needs Review"}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Check className="w-3.5 h-3.5" />
                Parsed Successfully
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                <Sparkles className="w-3 h-3 text-blue-600" />
                {overallScore}% Extraction Match
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Review & Verify Parsed Resume</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm or refine your extracted information before importing it into the live editor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-white shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: "personal", label: "Personal Info", icon: User, count: data.personalInfo.fullName ? 1 : 0 },
            { id: "experience", label: "Experience", icon: Briefcase, count: data.experience.length },
            { id: "education", label: "Education", icon: GraduationCap, count: data.education.length },
            { id: "skills", label: "Skills", icon: Code2, count: data.skills.length },
            { id: "projects", label: "Projects", icon: FolderGit2, count: data.projects.length },
            { id: "certifications", label: "Certifications", icon: Award, count: data.certifications.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto grow">
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-slate-600">
                      Full Name
                    </label>
                    {renderConfidenceBadge("fullName")}
                  </div>
                  <input
                    type="text"
                    value={data.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-slate-600">
                      Professional Headline / Role
                    </label>
                    {renderConfidenceBadge("jobTitle")}
                  </div>
                  <input
                    type="text"
                    value={data.personalInfo.jobTitle || ""}
                    onChange={(e) => handlePersonalInfoChange("jobTitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-slate-600">
                      Email Address
                    </label>
                    {renderConfidenceBadge("email")}
                  </div>
                  <input
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-slate-600">
                      Phone Number
                    </label>
                    {renderConfidenceBadge("phone")}
                  </div>
                  <input
                    type="text"
                    value={data.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-slate-600">
                      Location / City
                    </label>
                    {renderConfidenceBadge("location")}
                  </div>
                  <input
                    type="text"
                    value={data.personalInfo.location || ""}
                    onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.linkedin || ""}
                    onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Professional Summary
                </label>
                <textarea
                  rows={3}
                  value={data.summary || ""}
                  onChange={(e) => setData({ ...data, summary: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {data.experience.length} Positions Extracted
                </span>
                <div className="flex items-center gap-2">
                  {renderConfidenceBadge("experience")}
                  <button
                    type="button"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        experience: [
                          ...prev.experience,
                          {
                            id: generateId(),
                            company: "New Company",
                            position: "Role / Title",
                            startDate: "",
                            endDate: "Present",
                            current: true,
                            description: "",
                            highlights: [],
                          },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Position
                  </button>
                </div>
              </div>
              {data.experience.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No experience positions detected.</p>
              ) : (
                data.experience.map((exp, idx) => (
                  <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].company = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Position / Title</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].position = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].startDate = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].endDate = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {data.education.length} Academic Credentials Extracted
                </span>
                <div className="flex items-center gap-2">
                  {renderConfidenceBadge("education")}
                  <button
                    type="button"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        education: [
                          ...prev.education,
                          {
                            id: generateId(),
                            institution: "University / College",
                            degree: "Bachelor of Science",
                            fieldOfStudy: "Computer Science",
                            startDate: "",
                            endDate: "2024",
                            current: false,
                            gpa: "",
                            achievements: [],
                          },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Education
                  </button>
                </div>
              </div>
              {data.education.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No education records detected.</p>
              ) : (
                data.education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...data.education];
                            updated[idx].institution = e.target.value;
                            setData({ ...data, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Degree / Major</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...data.education];
                            updated[idx].degree = e.target.value;
                            setData({ ...data, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {data.skills.length} Skills Extracted
                </span>
                {renderConfidenceBadge("skills")}
              </div>
              <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill (e.g. Python, Docker, Leadership)..."
                  className="grow px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
                {data.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {data.projects.length} Projects Extracted
                </span>
                <div className="flex items-center gap-2">
                  {renderConfidenceBadge("projects")}
                  <button
                    type="button"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        projects: [
                          ...prev.projects,
                          {
                            id: generateId(),
                            title: "New Project",
                            description: "",
                            technologies: [],
                          },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Project
                  </button>
                </div>
              </div>
              {data.projects.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No projects detected.</p>
              ) : (
                data.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <button
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          projects: prev.projects.filter((p) => p.id !== proj.id),
                        }))
                      }
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                      title="Remove project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2 pr-8">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].title = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Link / URL</label>
                        <input
                          type="text"
                          value={proj.link || ""}
                          placeholder="https://..."
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].link = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500">Description / Highlights</label>
                      <textarea
                        rows={2}
                        value={proj.description || ""}
                        onChange={(e) => {
                          const updated = [...data.projects];
                          updated[idx].description = e.target.value;
                          setData({ ...data, projects: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "certifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {data.certifications.length} Certifications Extracted
                </span>
                <div className="flex items-center gap-2">
                  {renderConfidenceBadge("certifications")}
                  <button
                    type="button"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        certifications: [
                          ...prev.certifications,
                          {
                            id: generateId(),
                            name: "New Certification",
                            issuer: "",
                            date: "",
                          },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Certification
                  </button>
                </div>
              </div>
              {data.certifications.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No certifications detected.</p>
              ) : (
                data.certifications.map((cert, idx) => (
                  <div key={cert.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <button
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          certifications: prev.certifications.filter((c) => c.id !== cert.id),
                        }))
                      }
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                      title="Remove certification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Certificate Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = [...data.certifications];
                            updated[idx].name = e.target.value;
                            setData({ ...data, certifications: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Issuer / Organization</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const updated = [...data.certifications];
                            updated[idx].issuer = e.target.value;
                            setData({ ...data, certifications: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500">Date / Year</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => {
                            const updated = [...data.certifications];
                            updated[idx].date = e.target.value;
                            setData({ ...data, certifications: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {onStartOver && (
              <button
                type="button"
                onClick={onStartOver}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Over
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium transition"
            >
              Cancel
            </button>
          </div>
          <button
            type="button"
            onClick={() => onConfirm(data)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm"
          >
            Continue to Live Editor
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
