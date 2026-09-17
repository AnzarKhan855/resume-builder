"use client";

import React from "react";
import { AchievementItem } from "@/src/types/resume";
import { Plus, Trash2, Trophy } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionAchievementsProps {
  items: AchievementItem[];
  onChange: (items: AchievementItem[]) => void;
}

export default function SectionAchievements({ items = [], onChange }: SectionAchievementsProps) {
  const handleAddItem = () => {
    const newItem: AchievementItem = {
      id: generateId(),
      title: "",
      description: "",
      date: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof AchievementItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Honors & Achievements</h3>
          <p className="text-xs text-slate-500">
            Competitions, patents, dean&apos;s list, hackathon prizes, or industry recognitions.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Achievement
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl p-6">
          <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No achievements added</p>
          <p className="text-xs text-slate-400 mb-3">
            Add awards, scholarships, hackathon wins, or company recognitions.
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Achievement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="grow grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Award / Achievement Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Place - HackMIT 2023"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(item.id, "title", e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Date / Year
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Oct 2023"
                      value={item.date || ""}
                      onChange={(e) => handleUpdateItem(item.id, "date", e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Brief Context / Impact Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Selected out of 300+ teams for autonomous vehicle routing algorithm."
                  value={item.description || ""}
                  onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
