import React from "react";
import Link from "next/link";
import { AVAILABLE_TEMPLATES } from "@/src/components/templates/TemplateRenderer";
import { ArrowRight, Check, Sparkles, FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "ATS-Friendly Resume Templates | Resume Builder V2",
  description:
    "Explore our collection of 5 recruiter-approved, ATS-compliant resume templates: Classic, Modern, Minimal, Professional, and Technical.",
  openGraph: {
    title: "ATS-Friendly Resume Templates | Resume Builder V2",
    description: "Recruiter-approved templates engineered for ATS compatibility and executive appeal.",
  },
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
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

      {/* Hero */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            Tested on Workday, Lever, and Greenhouse
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            ATS-Friendly Resume Templates
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Every template is meticulously formatted to ensure 100% text readability for automated applicant tracking systems while creating an unforgettable impression on human hiring managers.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {AVAILABLE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="h-48 bg-slate-50 border-b border-slate-100 p-6 flex flex-col justify-center items-center relative">
                <FileText className="w-12 h-12 text-slate-300 mb-2" />
                <span className="text-xs font-bold text-slate-600">{tpl.name} Design</span>
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-blue-700 border border-slate-200 shadow-xs">
                  {tpl.badge}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{tpl.name}</h3>
                  <p className="text-xs font-semibold text-blue-600 mb-3">{tpl.tagline}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{tpl.description}</p>
                  <div className="text-xs text-slate-500 mb-6">
                    <strong className="text-slate-700">Recommended for:</strong> {tpl.bestFor}
                  </div>
                </div>

                <Link
                  href={`/editor/new?template=${tpl.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                >
                  Use {tpl.name} Template
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
            Designed for Readability by Recruiters and Applicant Tracking Systems
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our templates omit complex multi-column image wrappers, decorative charts, or invisible text tables that commonly disrupt ATS parsers. We use clean, standardized semantic headers and standard date tokens to ensure your experience and skills are indexed accurately.
          </p>
        </div>
      </main>
    </div>
  );
}
