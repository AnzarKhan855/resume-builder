"use client";

import React, { useState } from "react";
import { ProjectItem } from "@/src/types/resume";
import { Plus, Trash2, ChevronDown, ChevronUp, FolderGit2 } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionProjectsProps {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}

export default function SectionProjects({ items, onChange }: SectionProjectsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);

  const handleAddItem = () => {
    const newItem: ProjectItem = {
      id: generateId(),
      title: "",
      subtitle: "",
      link: "",
      github: "",
      startDate: "",
      endDate: "",
      technologies: [],
      description: "",
    };
    onChange([...items, newItem]);
    setExpandedId(newItem.id);
  };

  const handleUpdateItem = (id: string, field: keyof ProjectItem, value: any) => {
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
          <h3 className="text-sm font-bold text-slate-900">Featured Projects</h3>
          <p className="text-xs text-slate-500">
            Open-source contributions, web applications, or portfolio projects.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6">
          <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No projects added yet</p>
          <p className="text-xs text-slate-400 mb-4">
            Highlight systems you built, side-projects, or significant research work.
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add First Project
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
                {/* Header */}
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
                        {item.title || "Untitled Project"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {item.technologies && item.technologies.length > 0
                          ? item.technologies.join(", ")
                          : "No technologies specified"}
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

                {/* Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/40 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Project Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Distributed Analytics Dashboard"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(item.id, "title", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Role / Subtitle
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Creator & Lead Maintainer"
                          value={item.subtitle || ""}
                          onChange={(e) => handleUpdateItem(item.id, "subtitle", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Live URL / Demo Link
                        </label>
                        <input
                          type="text"
                          placeholder="https://myproject.app"
                          value={item.link || ""}
                          onChange={(e) => handleUpdateItem(item.id, "link", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          GitHub Repository URL
                        </label>
                        <input
                          type="text"
                          placeholder="github.com/username/project"
                          value={item.github || ""}
                          onChange={(e) => handleUpdateItem(item.id, "github", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Technologies Used (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Next.js, TypeScript, PostgreSQL, Tailwind CSS"
                        value={(item.technologies || []).join(", ")}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            "technologies",
                            e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Project Description & Outcomes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Engineered an event pipeline capable of handling 50k requests/second..."
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
