"use client";

import React, { useState, useMemo } from "react";
import { ResumeCustomization, TemplateId } from "@/src/types/resume";
import { COLOR_THEMES, FONT_OPTIONS, FONT_SIZES, SPACING_OPTIONS } from "@/src/lib/design-tokens";
import { TEMPLATES_REGISTRY, TEMPLATE_CATEGORIES, TemplateCategory } from "@/src/lib/templates-registry";
import { X, Palette, Type, Layout, Check, Search, ShieldCheck } from "lucide-react";

interface CustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customization: ResumeCustomization;
  currentTemplate: TemplateId;
  onUpdateCustomization: (newSettings: Partial<ResumeCustomization>) => void;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export default function CustomizationDrawer({
  isOpen,
  onClose,
  customization,
  currentTemplate,
  onUpdateCustomization,
  onSelectTemplate,
}: CustomizationDrawerProps) {
  const [templateSearch, setTemplateSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<TemplateCategory | "all">("all");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES_REGISTRY.filter((tpl) => {
      const matchesCat = selectedCat === "all" || tpl.category === selectedCat;
      const q = templateSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.tagline.toLowerCase().includes(q) ||
        tpl.bestFor.toLowerCase().includes(q) ||
        tpl.badge.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [templateSearch, selectedCat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Customize Resume</h2>
            <p className="text-xs text-slate-500">50 ATS-safe designs & styling</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 overflow-y-auto grow space-y-6">
        {/* Template Switcher with Search & Categories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Resume Template ({TEMPLATES_REGISTRY.length})
            </label>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> All 50 ATS Safe
            </span>
          </div>

          {/* Search bar */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates (e.g. Software, Data, Exec)..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 mb-2.5">
            <button
              type="button"
              onClick={() => setSelectedCat("all")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition shrink-0 ${
                selectedCat === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {TEMPLATE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCat(c.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition shrink-0 ${
                  selectedCat === c.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.label.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Templates list */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {filteredTemplates.map((tpl) => {
              const isSelected = currentTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelectTemplate(tpl.id as TemplateId)}
                  className={`w-full flex items-start justify-between p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{tpl.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-600">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{tpl.tagline}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Palette */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
            Accent Color
          </label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_THEMES.map((theme) => {
              const isSelected = customization.accentColor === theme.primary;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    onUpdateCustomization({
                      themeId: theme.id,
                      accentColor: theme.primary,
                    })
                  }
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 font-bold text-blue-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="truncate">{theme.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            Font Family
          </label>
          <div className="space-y-1.5">
            {FONT_OPTIONS.map((font) => {
              const isSelected = customization.fontFamily === font.fontFamily;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onUpdateCustomization({ fontFamily: font.fontFamily })}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition flex items-center justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 text-blue-900 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span style={{ fontFamily: font.fontFamily }}>{font.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Sizing */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Base Font Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FONT_SIZES.map((size) => {
              const isSelected = customization.fontSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => onUpdateCustomization({ fontSize: size.id as any })}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacing Presets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5" />
            Section Spacing
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SPACING_OPTIONS.map((sp) => {
              const isSelected = customization.spacing === sp.id;
              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => onUpdateCustomization({ spacing: sp.id as any })}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {sp.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
        >
          Apply Customizations
        </button>
      </div>
    </div>
  );
}
