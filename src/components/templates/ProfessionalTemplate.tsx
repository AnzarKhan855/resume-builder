import React from "react";
import { ResumeData } from "@/src/types/resume";

export default function ProfessionalTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements, languages, customSections, sectionOrder, customization } = data;

  const accentColor = customization?.accentColor || "#0f172a";
  const fontFamily = customization?.fontFamily || "var(--font-geist-sans), sans-serif";
  const fontSize = customization?.fontSize === "sm" ? "13px" : customization?.fontSize === "lg" ? "15px" : "14px";
  const headingSize = customization?.fontSize === "sm" ? "16px" : customization?.fontSize === "lg" ? "19px" : "17px";
  const nameSize = customization?.fontSize === "sm" ? "26px" : customization?.fontSize === "lg" ? "32px" : "28px";

  const renderSection = (secId: string) => {
    switch (secId) {
      case "summary":
        if (!summary) return null;
        return (
          <section key="summary" className="mb-5">
            <h2
              className="font-bold border-b-2 pb-1 mb-2 tracking-wide uppercase flex items-center justify-between"
              style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
            >
              <span>Executive Profile</span>
            </h2>
            <p className="text-slate-800 leading-relaxed text-justify">{summary}</p>
          </section>
        );

      case "experience":
        if (!experience || experience.length === 0) return null;
        return (
          <section key="experience" className="mb-5">
            <h2
              className="font-bold border-b-2 pb-1 mb-3 tracking-wide uppercase"
              style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
            >
              Professional Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">{exp.position}</h3>
                    <span className="text-slate-600 text-xs font-semibold uppercase">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-700 font-semibold mb-1">
                    <span>{exp.company}</span>
                    {exp.location && <span className="text-xs font-normal text-slate-500">{exp.location}</span>}
                  </div>
                  {exp.description && (
                    <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed mb-1">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-slate-700 text-sm space-y-0.5">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "education":
        if (!education || education.length === 0) return null;
        return (
          <section key="education" className="mb-5">
            <h2
              className="font-bold border-b-2 pb-1 mb-3 tracking-wide uppercase"
              style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
            >
              Education & Credentials
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h3 className="font-bold text-slate-900">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                    </h3>
                    <span className="text-slate-600 text-xs font-semibold">
                      {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-700">
                    <span>{edu.institution}</span>
                    {edu.location && <span className="text-xs text-slate-500">{edu.location}</span>}
                  </div>
                  {edu.gpa && <p className="text-xs text-slate-600 mt-0.5">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </section>
        );

      case "projects":
        if (!projects || projects.length === 0) return null;
        return (
          <section key="projects" className="mb-5">
            <h2
              className="font-bold border-b-2 pb-1 mb-3 tracking-wide uppercase"
              style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
            >
              Key Initiatives & Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h3 className="font-bold text-slate-900">
                      {proj.title}
                      {proj.link && (
                        <span className="font-normal text-xs text-blue-700 ml-2">({proj.link})</span>
                      )}
                    </h3>
                    {proj.startDate && (
                      <span className="text-slate-600 text-xs font-semibold">
                        {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ""}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (!skills || skills.length === 0) return null;
        return (
          <section key="skills" className="mb-5">
            <h2
              className="font-bold border-b-2 pb-1 mb-2 tracking-wide uppercase"
              style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
            >
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-sm text-slate-800">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (!certifications || certifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-5">
            <h2
              className="font-bold border-b-2 pb-1 mb-2 tracking-wide uppercase"
              style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
            >
              Certifications
            </h2>
            <div className="space-y-1 text-sm text-slate-700">
              {certifications.map((c) => (
                <div key={c.id}>
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  {c.issuer ? ` — ${c.issuer}` : ""}
                  {c.date ? ` (${c.date})` : ""}
                </div>
              ))}
            </div>
          </section>
        );

      case "achievements":
        if (!achievements || achievements.length === 0) return null;
        return (
          <section key="achievements" className="mb-5">
            <h2
              className="font-bold border-b-2 pb-1 mb-2 tracking-wide uppercase"
              style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
            >
              Awards & Recognition
            </h2>
            <div className="space-y-1 text-sm text-slate-700">
              {achievements.map((a) => (
                <div key={a.id}>
                  <span className="font-semibold text-slate-900">{a.title}</span>
                  {a.description ? `: ${a.description}` : ""}
                </div>
              ))}
            </div>
          </section>
        );

      case "languages":
        if (!languages || languages.length === 0) return null;
        return (
          <section key="languages" className="mb-5">
            <h2
              className="font-bold border-b-2 pb-1 mb-2 tracking-wide uppercase"
              style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
            >
              Languages
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-slate-800">
              {languages.map((l) => (
                <span key={l.id}>
                  <strong>{l.language}:</strong> {l.proficiency}
                </span>
              ))}
            </div>
          </section>
        );

      case "customSections":
        if (!customSections || customSections.length === 0) return null;
        return (
          <React.Fragment key="customSections">
            {customSections.map((sec) => (
              <section key={sec.id} className="mb-5">
                <h2
                  className="font-bold border-b-2 pb-1 mb-2 tracking-wide uppercase"
                  style={{ color: accentColor, borderColor: accentColor, fontSize: headingSize }}
                >
                  {sec.title}
                </h2>
                <div className="space-y-2">
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        {item.date && <span className="text-xs text-slate-600">{item.date}</span>}
                      </div>
                      {item.subtitle && <p className="text-xs text-slate-600 italic">{item.subtitle}</p>}
                      <p className="text-sm text-slate-700">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white text-slate-900 w-full max-w-[800px] mx-auto min-h-[1050px] shadow-sm overflow-hidden"
      style={{ fontFamily, fontSize }}
    >
      {/* Executive Header Banner */}
      <header className="p-8 md:p-10 text-white" style={{ backgroundColor: accentColor }}>
        <h1 className="font-bold tracking-tight mb-1" style={{ fontSize: nameSize }}>
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.jobTitle && (
          <p className="text-sm font-medium tracking-wide uppercase text-slate-200 mb-3">
            {personalInfo.jobTitle}
          </p>
        )}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-200">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
          {personalInfo.website && <span>• {personalInfo.website}</span>}
        </div>
      </header>

      {/* Main Body */}
      <div className="p-8 md:p-10">{sectionOrder.map((secId) => renderSection(secId))}</div>
    </div>
  );
}
