import React from "react";
import { ResumeData } from "@/src/types/resume";

export default function ModernTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements, languages, customSections, sectionOrder, customization } = data;

  const accentColor = customization?.accentColor || "#2563eb";
  const fontFamily = customization?.fontFamily || "var(--font-geist-sans), sans-serif";
  const fontSize = customization?.fontSize === "sm" ? "13px" : customization?.fontSize === "lg" ? "15px" : "14px";
  const headingSize = customization?.fontSize === "sm" ? "15px" : customization?.fontSize === "lg" ? "18px" : "16px";
  const nameSize = customization?.fontSize === "sm" ? "24px" : customization?.fontSize === "lg" ? "30px" : "26px";

  const renderSection = (secId: string) => {
    switch (secId) {
      case "summary":
        if (!summary) return null;
        return (
          <section key="summary" className="mb-5">
            <h2
              className="font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: accentColor, fontSize: headingSize }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              About Me
            </h2>
            <p className="text-slate-700 leading-relaxed pl-4 border-l-2 border-slate-200">{summary}</p>
          </section>
        );

      case "experience":
        if (!experience || experience.length === 0) return null;
        return (
          <section key="experience" className="mb-5">
            <h2
              className="font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: accentColor, fontSize: headingSize }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              Experience
            </h2>
            <div className="space-y-4 pl-4 border-l-2 border-slate-200">
              {experience.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="flex justify-between items-start flex-wrap">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{exp.position}</h3>
                      <p className="text-slate-700 font-medium text-sm">
                        {exp.company} {exp.location ? `• ${exp.location}` : ""}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 text-sm mt-1.5 whitespace-pre-line leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1 text-slate-600 text-sm space-y-0.5">
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
              className="font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: accentColor, fontSize: headingSize }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              Education
            </h2>
            <div className="space-y-3 pl-4 border-l-2 border-slate-200">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start flex-wrap">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {edu.institution} {edu.location ? `• ${edu.location}` : ""}
                    </p>
                    {edu.gpa && <p className="text-xs text-slate-500 mt-0.5">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-slate-500 text-xs font-medium">
                    {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                  </span>
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
              className="font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: accentColor, fontSize: headingSize }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              Featured Projects
            </h2>
            <div className="space-y-3 pl-4 border-l-2 border-slate-200">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h3 className="font-bold text-slate-900">
                      {proj.title}
                      {proj.link && (
                        <span className="font-normal text-xs text-blue-600 ml-2 underline">
                          {proj.link}
                        </span>
                      )}
                    </h3>
                    {proj.startDate && (
                      <span className="text-slate-500 text-xs">
                        {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ""}
                      </span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {proj.technologies.map((t, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
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
              className="font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: accentColor, fontSize: headingSize }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              Skills & Competencies
            </h2>
            <div className="flex flex-wrap gap-1.5 pl-4 border-l-2 border-slate-200">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-800"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (!certifications || certifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-5">
            <h2
              className="font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: accentColor, fontSize: headingSize }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              Certifications
            </h2>
            <div className="space-y-1.5 pl-4 border-l-2 border-slate-200">
              {certifications.map((c) => (
                <div key={c.id} className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  {c.issuer ? ` — ${c.issuer}` : ""}
                  {c.date ? ` (${c.date})` : ""}
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
              className="font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
              style={{ color: accentColor, fontSize: headingSize }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              Languages
            </h2>
            <div className="flex flex-wrap gap-3 pl-4 border-l-2 border-slate-200 text-sm text-slate-700">
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
                  className="font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
                  style={{ color: accentColor, fontSize: headingSize }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  {sec.title}
                </h2>
                <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        {item.date && <span className="text-xs text-slate-500">{item.date}</span>}
                      </div>
                      {item.subtitle && <p className="text-xs text-slate-500 italic">{item.subtitle}</p>}
                      <p className="text-sm text-slate-600">{item.description}</p>
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
      className="bg-white text-slate-900 p-8 md:p-12 w-full max-w-[800px] mx-auto min-h-[1050px] shadow-sm"
      style={{ fontFamily, fontSize }}
    >
      {/* Modern Top Header Banner */}
      <header className="mb-6 pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold tracking-tight text-slate-900" style={{ fontSize: nameSize }}>
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          {personalInfo.jobTitle && (
            <p className="text-base font-semibold mt-0.5" style={{ color: accentColor }}>
              {personalInfo.jobTitle}
            </p>
          )}
        </div>
        <div className="text-xs text-slate-600 space-y-1 text-left md:text-right">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedin && <div className="text-blue-600">{personalInfo.linkedin}</div>}
        </div>
      </header>

      {/* Ordered Sections */}
      <div>{sectionOrder.map((secId) => renderSection(secId))}</div>
    </div>
  );
}
