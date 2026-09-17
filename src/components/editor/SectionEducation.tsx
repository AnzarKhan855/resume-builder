"use client";

import React, { useState } from "react";
import { EducationItem } from "@/src/types/resume";
import { Plus, Trash2, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionEducationProps {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}

export default function SectionEducation({ items, onChange }: SectionEducationProps) {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);

  const handleAddItem = () => {
    const newItem: EducationItem = {
      id: generateId(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      achievements: [],
    };
    onChange([...items, newItem]);
    setExpandedId(newItem.id);
  };

  const handleUpdateItem = (id: string, field: keyof EducationItem, value: any) => {
    const updated = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    onChange(updated);
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Education</h3>
          <p className="text-xs text-slate-500">
            Degrees, certificates, or courses that demonstrate your academic foundation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Education
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No education entries added</p>
          <p className="text-xs text-slate-400 mb-4">
            Add your degrees, certifications, or academic programs.
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add First Education
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden transition"
              >
                {/* Card Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.degree || "Degree"} {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ""}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {item.institution || "University"} • {item.startDate || "Start"} —{" "}
                        {item.current ? "Present" : item.endDate || "End"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/40 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Institution / School <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. UC Berkeley"
                          value={item.institution}
                          onChange={(e) => handleUpdateItem(item.id, "institution", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Degree / Credential <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bachelor of Science"
                          value={item.degree}
                          onChange={(e) => handleUpdateItem(item.id, "degree", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Major / Field of Study
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science"
                          value={item.fieldOfStudy}
                          onChange={(e) => handleUpdateItem(item.id, "fieldOfStudy", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          GPA (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 3.85 / 4.0"
                          value={item.gpa || ""}
                          onChange={(e) => handleUpdateItem(item.id, "gpa", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2017"
                          value={item.startDate}
                          onChange={(e) => handleUpdateItem(item.id, "startDate", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Graduation Date
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2021"
                          value={item.endDate}
                          onChange={(e) => handleUpdateItem(item.id, "endDate", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
