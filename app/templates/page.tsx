"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TEMPLATES_REGISTRY,
  TEMPLATE_CATEGORIES,
  TemplateCategory,
} from "@/src/lib/templates-registry";
import {
  ArrowRight,
  Check,
  Sparkles,
  FileText,
  ArrowLeft,
  Search,
  CheckCircle2,
} from "lucide-react";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES_REGISTRY.filter((tpl) => {
      const matchesCategory =
        selectedCategory === "all" || tpl.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.tagline.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.bestFor.toLowerCase().includes(q) ||
        tpl.badge.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/editor/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            Create Resume
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-200/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            50 ATS-Compliant Professional Templates
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Recruiter-Approved Resume Templates
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every template is engineered for 100% text readability through Workday, Lever, Greenhouse, and Taleo, while projecting immediate authority to human hiring teams.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-8 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 50 templates by job title (e.g. Software Engineer, Data Analyst, Product Manager, Nurse)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              All Templates ({TEMPLATES_REGISTRY.length})
            </button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800">{filteredTemplates.length}</strong> of 50 ATS-safe templates
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% ATS Verified
          </span>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div
                className="h-44 border-b border-slate-100 p-6 flex flex-col justify-center items-center relative transition"
                style={{
                  backgroundColor: `${tpl.recommendedColor}08`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-2xs transition group-hover:scale-105"
                  style={{
                    backgroundColor: `${tpl.recommendedColor}15`,
                    color: tpl.recommendedColor,
                  }}
                >
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700">{tpl.name}</span>
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
                  {tpl.badge}
                </span>
                <span className="absolute bottom-3 left-3 text-[10px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <Check className="w-3 h-3" /> ATS Safe
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-0.5">{tpl.name}</h3>
                  <p
                    className="text-xs font-semibold mb-2.5"
                    style={{ color: tpl.recommendedColor }}
                  >
                    {tpl.tagline}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
                    {tpl.description}
                  </p>
                  <div className="text-[11px] text-slate-500 mb-5">
                    <strong className="text-slate-700">Best for:</strong> {tpl.bestFor}
                  </div>
                </div>

                <Link
                  href={`/editor/new?template=${tpl.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs group-hover:bg-blue-600"
                >
                  Use Template
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ATS Educational Note */}
        <div className="p-8 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-slate-800 max-w-4xl mx-auto">
          <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            Zero Data Loss Guarantee
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Switching templates never alters, deletes, or rearranges your underlying resume content. All 50 designs render dynamically from your unified profile data, giving you the freedom to test different visual approaches for each job application.
          </p>
        </div>
      </main>
    </div>
  );
}
