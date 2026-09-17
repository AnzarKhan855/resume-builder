"use client";

import React from "react";
import { CertificationItem } from "@/src/types/resume";
import { Plus, Trash2, Award } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionCertificationsProps {
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
}

export default function SectionCertifications({ items, onChange }: SectionCertificationsProps) {
  const handleAddItem = () => {
    const newItem: CertificationItem = {
      id: generateId(),
      name: "",
      issuer: "",
      date: "",
      url: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof CertificationItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Certifications & Licenses</h3>
          <p className="text-xs text-slate-500">
            Professional certifications, online credentials, or regulatory licenses.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Certification
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl p-6">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No certifications added</p>
          <p className="text-xs text-slate-400 mb-3">
            Add credentials like AWS Certified, PMP, Scrum Master, or Coursera Specializations.
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Certification
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs flex flex-col md:flex-row gap-3 items-start md:items-center justify-between"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 grow w-full">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AWS Solutions Architect"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services"
                    value={item.issuer}
                    onChange={(e) => handleUpdateItem(item.id, "issuer", e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 2023"
                    value={item.date}
                    onChange={(e) => handleUpdateItem(item.id, "date", e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
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
