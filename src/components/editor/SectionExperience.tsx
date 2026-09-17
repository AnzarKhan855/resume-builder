"use client";

import React, { useState } from "react";
import { ExperienceItem } from "@/src/types/resume";
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionExperienceProps {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
}

export default function SectionExperience({ items, onChange }: SectionExperienceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);

  const handleAddItem = () => {
    const newItem: ExperienceItem = {
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      highlights: [],
    };
    onChange([...items, newItem]);
    setExpandedId(newItem.id);
  };

  const handleUpdateItem = (id: string, field: keyof ExperienceItem, value: any) => {
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
          <h3 className="text-sm font-bold text-slate-900">Work Experience</h3>
          <p className="text-xs text-slate-500">
            List your relevant roles in reverse-chronological order.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Experience
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No experience entries added</p>
          <p className="text-xs text-slate-400 mb-4">
            Showcase your career milestones, internships, or freelance roles.
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add First Experience
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
                        {item.position || "Untitled Position"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {item.company || "Company"} • {item.startDate || "Start"} —{" "}
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
                      title="Delete experience"
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
                          Job Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Software Engineer"
                          value={item.position}
                          onChange={(e) => handleUpdateItem(item.id, "position", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Company / Employer <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Google"
                          value={item.company}
                          onChange={(e) => handleUpdateItem(item.id, "company", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Mountain View, CA or Remote"
                          value={item.location || ""}
                          onChange={(e) => handleUpdateItem(item.id, "location", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Jun 2021"
                            value={item.startDate}
                            onChange={(e) => handleUpdateItem(item.id, "startDate", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            placeholder={item.current ? "Present" : "e.g. Present"}
                            disabled={item.current}
                            value={item.current ? "Present" : item.endDate}
                            onChange={(e) => handleUpdateItem(item.id, "endDate", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 disabled:bg-slate-100 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id={`curr-${item.id}`}
                        checked={item.current}
                        onChange={(e) => handleUpdateItem(item.id, "current", e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`curr-${item.id}`} className="text-xs font-medium text-slate-700 cursor-pointer">
                        I currently work here
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Key Responsibilities & Impact
                      </label>
                      <textarea
                        rows={4}
                        placeholder="• Architected microservices with 99.99% uptime.&#10;• Reduced latency by 35% through caching..."
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 leading-relaxed focus:ring-2 focus:ring-blue-500"
                      />
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
