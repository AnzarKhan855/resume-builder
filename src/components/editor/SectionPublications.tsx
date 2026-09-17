"use client";

import React from "react";
import { PublicationItem } from "@/src/types/resume";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionPublicationsProps {
  items: PublicationItem[];
  onChange: (items: PublicationItem[]) => void;
}

export default function SectionPublications({ items = [], onChange }: SectionPublicationsProps) {
  const handleAddItem = () => {
    const newItem: PublicationItem = {
      id: generateId(),
      title: "",
      publisher: "",
      date: "",
      url: "",
      description: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof PublicationItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Publications & Research Papers</h3>
          <p className="text-xs text-slate-500">
            Peer-reviewed articles, conference proceedings, patents, or whitepapers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Publication
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl p-6">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No publications added</p>
          <p className="text-xs text-slate-400 mb-3">
            Add journal articles, conference papers, research reports, or books.
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Publication
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
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Paper / Publication Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Consensus in Asynchronous Networks"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(item.id, "title", e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Publisher / Journal / Conference
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. IEEE Transactions on Software Engineering"
                        value={item.publisher || ""}
                        onChange={(e) => handleUpdateItem(item.id, "publisher", e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Publication Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. May 2023"
                        value={item.date || ""}
                        onChange={(e) => handleUpdateItem(item.id, "date", e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        DOI / URL Link
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. doi.org/10.1109/..."
                        value={item.url || ""}
                        onChange={(e) => handleUpdateItem(item.id, "url", e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
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
