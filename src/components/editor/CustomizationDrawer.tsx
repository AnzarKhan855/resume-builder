"use client";

import React from "react";
import { ResumeCustomization, TemplateId } from "@/src/types/resume";
import { COLOR_THEMES, FONT_OPTIONS, FONT_SIZES, SPACING_OPTIONS } from "@/src/lib/design-tokens";
import { AVAILABLE_TEMPLATES } from "@/src/components/templates/TemplateRenderer";
import { X, Palette, Type, Layout, Check } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Customize Resume</h2>
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
        {/* Template Switcher */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
            Resume Template
          </label>
          <div className="grid grid-cols-1 gap-2">
            {AVAILABLE_TEMPLATES.map((tpl) => {
              const isSelected = currentTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelectTemplate(tpl.id as TemplateId)}
                  className={`flex items-start justify-between p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{tpl.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{tpl.tagline}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Palette */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
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
                    className="w-4 h-4 rounded-full shrink-0 border border-black/10"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
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
