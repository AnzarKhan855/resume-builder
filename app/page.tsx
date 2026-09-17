"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import ResumeUploadModal from "@/src/components/import/ResumeUploadModal";
import ImportReviewModal from "@/src/components/import/ImportReviewModal";
import { ResumeData } from "@/src/types/resume";
import { AVAILABLE_TEMPLATES } from "@/src/components/templates/TemplateRenderer";
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  Eye,
  Download,
  Layers,
  Edit3,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [parsedImportData, setParsedImportData] = useState<ResumeData | null>(null);
  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState("modern");

  const handleUploadSuccess = (data: ResumeData) => {
    setIsUploadModalOpen(false);
    setParsedImportData(data);
  };

  const handleImportConfirmed = async (finalData: ResumeData) => {
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      if (res.ok) {
        const result = await res.json();
        const id = result.resume?._id || result.resume?.id;
        router.push(id ? `/editor/${id}` : "/editor/new");
      } else {
        router.push("/editor/new");
      }
    } catch {
      router.push("/editor/new");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-black text-slate-900 text-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              RB
            </div>
            <span className="tracking-tight">ResumeForge</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
              V2
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/templates" className="hover:text-blue-600 transition">
              Templates
            </Link>
            <Link href="/features" className="hover:text-blue-600 transition">
              Features
            </Link>
            <Link href="/how-it-works" className="hover:text-blue-600 transition">
              How It Works
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-xs"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-xs"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-6 overflow-hidden bg-radial from-blue-50/70 via-white to-white">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-semibold text-blue-700 mb-6 animate-fade-in shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>ATS-Friendly • Realtime Live Preview • Smart Import</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Build a Resume That <br className="hidden sm:inline" />
            <span className="text-blue-600">Gets Noticed.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create an interview-winning resume from scratch or import your existing PDF/DOCX in seconds.
            Tailored for Applicant Tracking Systems and hiring managers alike.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/editor/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
            >
              Create Resume from Scratch
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-slate-800 font-bold text-base transition hover:scale-[1.02]"
            >
              <UploadCloud className="w-5 h-5 text-blue-600" />
              Import Existing Resume
            </button>
          </div>

          {/* Realistic Resume Mockup Preview */}
          <div className="relative max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-200 to-slate-100 p-3 sm:p-6 shadow-2xl border border-slate-200/80">
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-10 text-left border border-slate-100 font-sans">
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-5 mb-6 gap-3">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Alex Morgan</h3>
                  <p className="text-sm font-bold text-blue-600 mt-0.5">Senior Full-Stack Engineer</p>
                </div>
                <div className="text-xs text-slate-500 sm:text-right space-y-0.5">
                  <p>alex.morgan@example.com • +1 (555) 234-5678</p>
                  <p>San Francisco, CA • linkedin.com/in/alexmorgan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b pb-1 mb-2">
                      Professional Experience
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-900">
                          <span>Lead Software Engineer — CloudScale Technologies</span>
                          <span className="text-slate-500">2022 — Present</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          • Spearheaded cloud migration serving 1.2M users with 99.99% uptime.
                          <br />
                          • Optimized microservice latency by 42% via edge caching.
                        </p>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-900">
                          <span>Full-Stack Developer — Apex Digital Labs</span>
                          <span className="text-slate-500">2019 — 2022</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          • Engineered reactive web portals using Next.js, Node, and PostgreSQL.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b pb-1 mb-2">
                      Core Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "AWS", "Docker"].map((s) => (
                        <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b pb-1 mb-2">
                      Education
                    </h4>
                    <p className="text-xs font-bold text-slate-900">B.S. Computer Science</p>
                    <p className="text-xs text-slate-500">UC Berkeley • 2019</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating feature pills */}
            <div className="hidden sm:flex absolute -bottom-4 left-8 bg-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-100 items-center gap-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              100% ATS Readable
            </div>
            <div className="hidden sm:flex absolute -top-4 right-8 bg-white px-3.5 py-1.5 rounded-full shadow-lg border border-slate-100 items-center gap-2 text-xs font-bold text-blue-700">
              <Eye className="w-4 h-4 text-blue-500" />
              Instant Live Preview
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-20 px-6 bg-slate-50 border-t border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Land Your Next Role
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Designed from the ground up to give candidates unfair recruiter appeal and complete control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Edit3,
                title: "Build from Scratch",
                desc: "Intuitive multi-section editor with guided prompts, character counters, and bullet point inspiration.",
              },
              {
                icon: UploadCloud,
                title: "Import Existing Resume",
                desc: "Upload any PDF or DOCX file. Our smart parser extracts contact details, job history, and skills automatically.",
              },
              {
                icon: FileCheck2,
                title: "ATS-Friendly Templates",
                desc: "Every template is engineered to cleanly parse through Applicant Tracking Systems (Workday, Greenhouse, Lever).",
              },
              {
                icon: Eye,
                title: "Instant Live Preview",
                desc: "Real-time side-by-side preview shows changes immediately with scale-to-fit zoom and mobile toggling.",
              },
              {
                icon: Download,
                title: "Crisp Multi-Page PDF",
                desc: "High-DPI vector PDF export with page break prevention, selectable text, and clean print formatting.",
              },
              {
                icon: Layers,
                title: "Resume Management",
                desc: "Manage multiple tailored resumes on your dashboard. Duplicate, edit, and organize versions with ease.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From Blank Page to Job Offer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Choose How You Start",
                desc: "Start fresh with our structured builder or upload an existing PDF/DOCX to auto-populate your background.",
              },
              {
                step: "02",
                title: "Build & Tailor Info",
                desc: "Customize experiences, reorder sections with drag-and-drop, and monitor your completeness score.",
              },
              {
                step: "03",
                title: "Customize & Export",
                desc: "Pick from 5 recruiter-tested templates, adjust fonts & accent colors, and download your pristine PDF.",
              },
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col">
                <span className="text-3xl font-black text-blue-600/30 mb-3">{step.step}</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATE SHOWCASE */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              Recruiter-Approved Designs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              5 Professional ATS Templates
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Switch between templates at any time without losing any resume details.
            </p>
          </div>

          {/* Template Tab Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {AVAILABLE_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplatePreview(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  selectedTemplatePreview === t.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{t.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedTemplatePreview === t.id ? "bg-blue-700 text-blue-100" : "bg-slate-100 text-slate-500"}`}>
                  {t.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Template Highlights Card */}
          {(() => {
            const currentTpl = AVAILABLE_TEMPLATES.find((t) => t.id === selectedTemplatePreview)!;
            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900">{currentTpl.name} Template</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {currentTpl.badge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{currentTpl.description}</p>
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">Best for:</strong> {currentTpl.bestFor}
                  </p>
                </div>

                <Link
                  href={`/editor/new?template=${currentTpl.id}`}
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-xs"
                >
                  Use {currentTpl.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })()}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Build your professional resume today.
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who landed interviews at leading companies with ResumeForge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/editor/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-base hover:bg-blue-50 transition shadow-lg"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/40 hover:border-white text-white font-bold text-base transition"
            >
              <UploadCloud className="w-5 h-5" />
              Upload & Parse Resume
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
              RB
            </div>
            <span>ResumeForge V2</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/templates" className="hover:text-white transition">
              Templates
            </Link>
            <Link href="/features" className="hover:text-white transition">
              Features
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition">
              How It Works
            </Link>
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
          </div>

          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} ResumeForge. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Import Review Modal */}
      {parsedImportData && (
        <ImportReviewModal
          isOpen={Boolean(parsedImportData)}
          initialData={parsedImportData}
          onClose={() => setParsedImportData(null)}
          onConfirm={handleImportConfirmed}
        />
      )}
    </div>
  );
}