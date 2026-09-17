"use client";

import React, { useState } from "react";
import { CustomSection, CustomSectionItem } from "@/src/types/resume";
import { Plus, Trash2, PlusSquare } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionCustomProps {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

export default function SectionCustom({ sections, onChange }: SectionCustomProps) {
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    const newSec: CustomSection = {
      id: generateId(),
      title: newSectionTitle.trim(),
      items: [
        {
          id: generateId(),
          title: "Title / Role",
          subtitle: "Organization / Context",
          date: "2023",
          description: "Details regarding this accomplishment or activity...",
        },
      ],
    };

    onChange([...sections, newSec]);
    setNewSectionTitle("");
  };

  const handleDeleteSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  const handleAddItemToSection = (sectionId: string) => {
    onChange(
      sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newItem: CustomSectionItem = {
          id: generateId(),
          title: "",
          subtitle: "",
          date: "",
          description: "",
        };
        return { ...sec, items: [...sec.items, newItem] };
      })
    );
  };

  const handleUpdateItem = (
    sectionId: string,
    itemId: string,
    field: keyof CustomSectionItem,
    val: string
  ) => {
    onChange(
      sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.map((item) => (item.id === itemId ? { ...item, [field]: val } : item)),
        };
      })
    );
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    onChange(
      sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-bold text-slate-900">Custom Sections</h3>
        <p className="text-xs text-slate-500">
          Create specialized sections like &ldquo;Volunteer Work&rdquo;, &ldquo;Publications&rdquo;, &ldquo;Patents&rdquo;, or &ldquo;Speaking Engagements&rdquo;.
        </p>
      </div>

      {/* Add new section heading */}
      <form onSubmit={handleAddSection} className="flex gap-2">
        <input
          type="text"
          placeholder="New section name (e.g. Publications, Volunteer Work)..."
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          className="grow px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Create Section
        </button>
      </form>

      {/* Existing Custom Sections */}
      {sections.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl p-6">
          <PlusSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No custom sections created</p>
          <p className="text-xs text-slate-400">
            You can add any bespoke section not covered by standard templates.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) =>
                    onChange(
                      sections.map((s) => (s.id === sec.id ? { ...s, title: e.target.value } : s))
                    )
                  }
                  className="font-bold text-sm text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddItemToSection(sec.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sec.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {sec.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(sec.id, item.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-6">
                      <input
                        type="text"
                        placeholder="Item Title"
                        value={item.title}
                        onChange={(e) => handleUpdateItem(sec.id, item.id, "title", e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Subtitle / Context"
                        value={item.subtitle || ""}
                        onChange={(e) => handleUpdateItem(sec.id, item.id, "subtitle", e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Date"
                        value={item.date || ""}
                        onChange={(e) => handleUpdateItem(sec.id, item.id, "date", e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Description..."
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateItem(sec.id, item.id, "description", e.target.value)
                      }
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
