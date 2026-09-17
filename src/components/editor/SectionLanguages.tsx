"use client";

import React from "react";
import { LanguageItem } from "@/src/types/resume";
import { Plus, Trash2, Globe } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionLanguagesProps {
  items: LanguageItem[];
  onChange: (items: LanguageItem[]) => void;
}

export default function SectionLanguages({ items, onChange }: SectionLanguagesProps) {
  const handleAddItem = () => {
    const newItem: LanguageItem = {
      id: generateId(),
      language: "",
      proficiency: "Professional",
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof LanguageItem, value: any) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Languages</h3>
          <p className="text-xs text-slate-500">
            Showcase your multilingual fluency and communication skills.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Language
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl p-6">
          <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No languages added</p>
          <p className="text-xs text-slate-400 mb-3">
            Add languages you speak or write fluently.
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Language
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-xs flex items-center justify-between gap-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 grow">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spanish, French, German"
                    value={item.language}
                    onChange={(e) => handleUpdateItem(item.id, "language", e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Proficiency Level
                  </label>
                  <select
                    value={item.proficiency}
                    onChange={(e) => handleUpdateItem(item.id, "proficiency", e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Native">Native / Bilingual</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Professional">Professional Working</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Basic">Basic Elementary</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
