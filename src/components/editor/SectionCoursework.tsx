"use client";

import React, { useState } from "react";
import { CourseworkItem } from "@/src/types/resume";
import { Plus, X, GraduationCap } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionCourseworkProps {
  items: CourseworkItem[];
  onChange: (items: CourseworkItem[]) => void;
}

export default function SectionCoursework({ items = [], onChange }: SectionCourseworkProps) {
  const [courseInput, setCourseInput] = useState("");

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseInput.trim()) return;

    const names = courseInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const newItems: CourseworkItem[] = names.map((name) => ({
      id: generateId(),
      name,
    }));

    onChange([...items, ...newItems]);
    setCourseInput("");
  };

  const handleRemoveCourse = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-bold text-slate-900">Relevant Coursework</h3>
        <p className="text-xs text-slate-500">
          Undergraduate, graduate, or specialization courses matching your target job requirements.
        </p>
      </div>

      <form onSubmit={handleAddCourse} className="flex gap-2">
        <input
          type="text"
          placeholder="Add course name (e.g. Distributed Systems, Algorithms, Deep Learning)..."
          value={courseInput}
          onChange={(e) => setCourseInput(e.target.value)}
          className="grow px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl p-6">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No coursework added</p>
          <p className="text-xs text-slate-400">
            Great for students, fresh graduates, and career changers to show domain expertise.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-2">
          {items.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
            >
              {c.name}
              <button
                type="button"
                onClick={() => handleRemoveCourse(c.id)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
