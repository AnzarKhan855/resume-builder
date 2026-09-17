"use client";

import React from "react";
import { VolunteerItem } from "@/src/types/resume";
import { Plus, Trash2, HeartHandshake } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionVolunteerProps {
  items: VolunteerItem[];
  onChange: (items: VolunteerItem[]) => void;
}

export default function SectionVolunteer({ items = [], onChange }: SectionVolunteerProps) {
  const handleAddItem = () => {
    const newItem: VolunteerItem = {
      id: generateId(),
      organization: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      highlights: [],
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof VolunteerItem, value: any) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Volunteer Experience & Community</h3>
          <p className="text-xs text-slate-500">
            Nonprofit leadership, mentoring, open-source maintainership, or civic initiatives.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Volunteer Role
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl p-6">
          <HeartHandshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No volunteer experience added</p>
          <p className="text-xs text-slate-400 mb-3">
            Add community contributions, mentorship programs, or volunteer organizations.
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Volunteer Role
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grow space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Role / Volunteer Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Volunteer Coding Instructor"
                        value={item.role}
                        onChange={(e) => handleUpdateItem(item.id, "role", e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Organization / Non-Profit
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Code in the Community"
                        value={item.organization}
                        onChange={(e) => handleUpdateItem(item.id, "organization", e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jun 2022"
                        value={item.startDate || ""}
                        onChange={(e) => handleUpdateItem(item.id, "startDate", e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Present"
                        value={item.endDate || ""}
                        onChange={(e) => handleUpdateItem(item.id, "endDate", e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chicago, IL"
                        value={item.location || ""}
                        onChange={(e) => handleUpdateItem(item.id, "location", e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Contributions & Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Taught introductory Python to 40+ underprivileged high school students weekly."
                      value={item.description || ""}
                      onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
