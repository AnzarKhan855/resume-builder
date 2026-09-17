"use client";

import React from "react";
import { GripVertical, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { DEFAULT_SECTION_ORDER } from "@/src/types/resume";

const SECTION_LABELS: { [key: string]: string } = {
  personalInfo: "Personal Information (Always at top)",
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  projects: "Featured Projects",
  skills: "Skills & Expertise",
  certifications: "Certifications & Licenses",
  achievements: "Honors & Achievements",
  languages: "Languages",
  publications: "Publications & Research",
  volunteer: "Volunteer Experience",
  coursework: "Relevant Coursework",
  customSections: "Custom Sections",
};

interface SectionReorderProps {
  sectionOrder: string[];
  onChange: (newOrder: string[]) => void;
}

export default function SectionReorder({ sectionOrder, onChange }: SectionReorderProps) {
  // Move item up
  const moveUp = (index: number) => {
    if (index <= 1) return; // Keep personalInfo at position 0
    const newOrder = [...sectionOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    onChange(newOrder);
  };

  // Move item down
  const moveDown = (index: number) => {
    if (index === 0 || index >= sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    onChange(newOrder);
  };

  const handleReset = () => {
    onChange([...DEFAULT_SECTION_ORDER]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Reorder Resume Sections</h3>
          <p className="text-xs text-slate-500">
            Customize the visual order of sections. Both live preview and PDF exports will reflect this order.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Order
        </button>
      </div>

      <div className="space-y-2">
        {sectionOrder.map((secId, idx) => {
          const isFixed = secId === "personalInfo";
          const isFirstMovable = idx === 1;
          const isLast = idx === sectionOrder.length - 1;

          return (
            <div
              key={secId}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                isFixed
                  ? "bg-slate-50 border-slate-200 text-slate-400"
                  : "bg-white border-slate-200 hover:border-blue-300 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  <GripVertical className="w-4 h-4" />
                </span>
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {SECTION_LABELS[secId] || secId}
                </span>
              </div>

              {!isFixed && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isFirstMovable}
                    onClick={() => moveUp(idx)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => moveDown(idx)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
