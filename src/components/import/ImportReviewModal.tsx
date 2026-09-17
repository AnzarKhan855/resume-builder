"use client";

import React, { useState } from "react";
import { ResumeData } from "@/src/types/resume";
import { X, Check, ArrowRight, User, Briefcase, GraduationCap, Code2, Plus, Trash2 } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface ImportReviewModalProps {
  isOpen: boolean;
  initialData: ResumeData;
  onClose: () => void;
  onConfirm: (finalData: ResumeData) => void;
}

export default function ImportReviewModal({
  isOpen,
  initialData,
  onClose,
  onConfirm,
}: ImportReviewModalProps) {
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "skills">("personal");
  const [newSkill, setNewSkill] = useState("");

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-1 border border-emerald-200/60">
              <Check className="w-3.5 h-3.5" />
              Resume Extracted
            </div>
            <h2 className="text-xl font-bold text-slate-900">Review & Correct Extracted Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your information before loading it into the live editor. You can always edit later.
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
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-white shrink-0 overflow-x-auto">
          {[
            { id: "personal", label: "Personal Info", icon: User, count: data.personalInfo.fullName ? 1 : 0 },
            { id: "experience", label: "Experience", icon: Briefcase, count: data.experience.length },
            { id: "education", label: "Education", icon: GraduationCap, count: data.education.length },
            { id: "skills", label: "Skills", icon: Code2, count: data.skills.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
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
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Job Title / Professional Headline
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.jobTitle || ""}
                    onChange={(e) => handlePersonalInfoChange("jobTitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
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
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Website / Portfolio
                  </label>
                  <input
                    type="text"
                    value={data.personalInfo.website || ""}
                    onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
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
                  value={data.summary}
                  onChange={(e) => setData({ ...data, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-4">
              {data.experience.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No experience entries detected. You can add them in the editor.
                </div>
              ) : (
                data.experience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2 pr-8">
                      <div>
                        <label className="text-xs font-medium text-slate-500">Job Title</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].position = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Company</label>
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
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Description / Bullets</label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[idx].description = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-4">
              {data.education.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No education entries detected. You can add them in the editor.
                </div>
              ) : (
                data.education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="text-xs font-medium text-slate-500">Institution / University</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...data.education];
                            updated[idx].institution = e.target.value;
                            setData({ ...data, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Degree / Major</label>
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

              <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
          >
            Cancel
          </button>
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
