import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, UploadCloud, Eye, Download, Sliders, Shield } from "lucide-react";

export const metadata = {
  title: "Features | Resume Builder V2",
  description:
    "Discover the powerful suite of resume-building features: smart parsing, ATS templates, drag-and-drop section reordering, live preview, and vector PDF export.",
};

export default function FeaturesPage() {
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

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Engineered for Impact
          </h1>
          <p className="text-slate-600 text-base">
            Every feature is crafted to remove friction, elevate your professional story, and boost interview callbacks.
          </p>
        </div>

        <div className="space-y-12 mb-20">
          {[
            {
              icon: UploadCloud,
              title: "Smart PDF & DOCX Import Engine",
              description:
                "Don't start from scratch if you already have an existing resume. Our heuristic parser extracts contact data, employment history, degrees, and skills into structured fields. Review and edit extracted details before loading them into the editor.",
            },
            {
              icon: Eye,
              title: "Synchronized Live Preview",
              description:
                "See changes in real-time as you type. Our live preview renders exact margins, fonts, and page layouts so you never have to guess what your final download looks like.",
            },
            {
              icon: Sliders,
              title: "Section Management & Drag & Drop Reordering",
              description:
                "Tailor section hierarchy for each role. Easily move Projects above Experience, or highlight Certifications before Education. Both preview and PDF respect your exact order.",
            },
            {
              icon: Download,
              title: "Pixel-Perfect Multi-Page PDF & Print Engine",
              description:
                "Export crisp, selectable-text PDFs with zero clipped content or awkward page breaks. Also supports vector print styling directly via your browser.",
            },
            {
              icon: Shield,
              title: "ATS-Safe Formatting Standards",
              description:
                "Applicant Tracking Systems reject convoluted graphics and tables. We prioritize semantic hierarchy, standard headers, and high contrast so your qualifications get indexed accurately.",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
