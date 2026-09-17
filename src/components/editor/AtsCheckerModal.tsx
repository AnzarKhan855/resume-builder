"use client";

import React, { useMemo } from "react";
import { ResumeData } from "@/src/types/resume";
import { auditResumeForAts, AtsAuditResult } from "@/src/lib/ats-checker";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react";

interface AtsCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  onToggleAtsMode: (enabled: boolean) => void;
}

export default function AtsCheckerModal({
  isOpen,
  onClose,
  data,
  onToggleAtsMode,
}: AtsCheckerModalProps) {
  const audit: AtsAuditResult = useMemo(() => auditResumeForAts(data), [data]);
  const isAtsMode = Boolean(data.isAtsMode);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">ATS Readiness & Quality Audit</h2>
              <p className="text-xs text-slate-500">Automated Applicant Tracking System compliance analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* Score Hero */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-black ${getScoreColor(
                  audit.score
                )}`}
              >
                <span className="text-2xl leading-none">{audit.score}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">/ 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Grade: {audit.grade}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white border border-slate-200 text-slate-700">
                    {audit.passedChecksCount} of {audit.totalChecksCount} Checks Passed
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  {audit.score >= 85
                    ? "Your resume has high structural integrity and strong ATS readability."
                    : audit.score >= 70
                    ? "Solid foundation. Address the tips below to boost keyword parsing."
                    : "Missing essential sections or metrics. Follow the recommendations below."}
                </p>
              </div>
            </div>

            {/* ATS Mode Quick Switch */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-right w-full sm:w-auto shrink-0 shadow-2xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Strict ATS Layout Mode
              </span>
              <button
                type="button"
                onClick={() => onToggleAtsMode(!isAtsMode)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isAtsMode
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {isAtsMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {isAtsMode ? "Strict ATS: Active" : "Enable Strict ATS"}
              </button>
            </div>
          </div>

          {/* Action Verbs & Metrics Spotlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Action Verbs Found ({audit.actionVerbsFound.length})
                </span>
                <span className="text-[10px] text-slate-500">4+ recommended</span>
              </div>
              {audit.actionVerbsFound.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {audit.actionVerbsFound.map((verb) => (
                    <span
                      key={verb}
                      className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 text-[11px] font-medium capitalize"
                    >
                      {verb}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No strong action verbs identified.</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  Measurable Metrics ({audit.metricsFound.length})
                </span>
                <span className="text-[10px] text-slate-500">%, $, numbers</span>
              </div>
              {audit.metricsFound.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {audit.metricsFound.slice(0, 6).map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200 text-[11px] font-semibold"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No numeric impact metrics detected.</p>
              )}
            </div>
          </div>

          {/* Detailed Verification Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Diagnostic Audit Breakdown
            </h3>
            <div className="space-y-2">
              {audit.checks.map((check) => (
                <div
                  key={check.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                    check.passed
                      ? "bg-white border-slate-200"
                      : "bg-amber-50/40 border-amber-200/80"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span
                        className={`font-semibold ${
                          check.passed ? "text-slate-800" : "text-amber-900 font-bold"
                        }`}
                      >
                        {check.label}
                      </span>
                      {check.tip && (
                        <p className="text-slate-600 text-[11px] mt-0.5">{check.tip}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`font-bold shrink-0 ${
                      check.passed ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    +{check.score}/{check.maxScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
