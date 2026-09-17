"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SectionSummaryProps {
  summary: string;
  onChange: (value: string) => void;
}

export default function SectionSummary({ summary, onChange }: SectionSummaryProps) {
  const suggestions = [
    "Passionate software engineer with 5+ years building scalable cloud platforms and web applications.",
    "Results-driven leader with a proven record of leading cross-functional teams to deliver enterprise software.",
    "Detail-oriented data analyst specialized in predictive modeling, SQL, and business intelligence reporting.",
  ];

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-bold text-slate-900">Professional Summary</h3>
        <p className="text-xs text-slate-500">
          A compelling 2–4 sentence overview of your career achievements, core strengths, and goals.
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-slate-700">Summary Statement</label>
          <span className="text-[11px] text-slate-400">{summary.length} characters</span>
        </div>
        <textarea
          rows={5}
          placeholder="e.g. Senior Full-Stack Engineer with 6+ years of experience designing and scaling distributed web applications..."
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Suggested Starters */}
      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Inspiration / Suggested Starters</span>
        </div>
        <div className="space-y-1.5">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(s)}
              className="w-full text-left text-xs text-blue-900/80 hover:text-blue-900 hover:bg-blue-100/50 p-2 rounded-lg transition"
            >
              &ldquo;{s}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
