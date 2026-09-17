import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = {
  title: "How It Works | Resume Builder V2",
  description:
    "Learn how easy it is to create, customize, and download an ATS-compliant resume with Resume Builder V2.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/editor/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            How ResumeForge Works
          </h1>
          <p className="text-slate-600 text-base">
            Three simple steps to your most polished resume yet.
          </p>
        </div>

        <div className="space-y-12 mb-16">
          {[
            {
              step: "Step 1",
              title: "Choose How You Want to Start",
              desc: "You can either begin with a fresh, structured form or upload your existing resume in PDF or DOCX format. If you upload a file, our parser extracts your contact info, jobs, degrees, and skills for you to review and correct.",
            },
            {
              step: "Step 2",
              title: "Build, Tailor & Reorder Sections",
              desc: "Use our card-based editor to refine your responsibilities, add measurable impact bullets, adjust skill categories, and reorder sections using drag-and-drop. Our live completeness meter highlights areas for improvement in real-time.",
            },
            {
              step: "Step 3",
              title: "Select a Template & Download Pristine PDF",
              desc: "Choose between Classic, Modern, Minimal, Professional, or Technical styles. Customize fonts, accent colors, and spacing. Then export a high-resolution, multi-page aware PDF ready to upload to job boards.",
            },
          ].map((s, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex gap-6 items-start">
              <span className="text-2xl font-black text-blue-600 bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                {idx + 1}
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-12 border-t border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to land your dream job?</h3>
          <Link
            href="/editor/new"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md"
          >
            Start Building Your Resume Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
