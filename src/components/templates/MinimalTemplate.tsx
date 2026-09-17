import React from "react";
import { ResumeData } from "@/src/types/resume";

export default function MinimalTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, projects, skills, certifications, languages, customSections, sectionOrder, customization } = data;

  const accentColor = customization?.accentColor || "#0f172a";
  const fontFamily = customization?.fontFamily || "var(--font-geist-sans), sans-serif";
  const fontSize = customization?.fontSize === "sm" ? "12.5px" : customization?.fontSize === "lg" ? "14.5px" : "13.5px";
  const headingSize = customization?.fontSize === "sm" ? "14px" : customization?.fontSize === "lg" ? "16px" : "15px";
  const nameSize = customization?.fontSize === "sm" ? "22px" : customization?.fontSize === "lg" ? "28px" : "25px";

  const renderSection = (secId: string) => {
    switch (secId) {
      case "summary":
        if (!summary) return null;
        return (
          <section key="summary" className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <h2 className="font-semibold text-slate-400 uppercase tracking-widest text-xs" style={{ fontSize: headingSize }}>
              Summary
            </h2>
            <div className="md:col-span-3 text-slate-800 leading-relaxed">{summary}</div>
          </section>
        );

      case "experience":
        if (!experience || experience.length === 0) return null;
        return (
          <section key="experience" className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <h2 className="font-semibold text-slate-400 uppercase tracking-widest text-xs" style={{ fontSize: headingSize }}>
              Experience
            </h2>
            <div className="md:col-span-3 space-y-5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                    <span className="text-slate-400 text-xs font-mono">
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs font-medium mb-1">
                    {exp.company} {exp.location ? `· ${exp.location}` : ""}
                  </p>
                  {exp.description && (
                    <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1 text-slate-700 text-sm space-y-0.5">
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
          <section key="education" className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <h2 className="font-semibold text-slate-400 uppercase tracking-widest text-xs" style={{ fontSize: headingSize }}>
              Education
            </h2>
            <div className="md:col-span-3 space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-slate-900">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                    </h3>
                    <span className="text-slate-400 text-xs font-mono">
                      {edu.startDate} — {edu.current ? "Present" : edu.endDate}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    {edu.institution} {edu.location ? `· ${edu.location}` : ""}
                  </p>
                  {edu.gpa && <p className="text-xs text-slate-500 mt-0.5">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </section>
        );

      case "projects":
        if (!projects || projects.length === 0) return null;
        return (
          <section key="projects" className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <h2 className="font-semibold text-slate-400 uppercase tracking-widest text-xs" style={{ fontSize: headingSize }}>
              Projects
            </h2>
            <div className="md:col-span-3 space-y-4">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-slate-900">
                      {proj.title}
                      {proj.link && <span className="text-xs font-normal text-slate-500 ml-2">({proj.link})</span>}
                    </h3>
                    {proj.startDate && (
                      <span className="text-slate-400 text-xs font-mono">
                        {proj.startDate} {proj.endDate ? `— ${proj.endDate}` : ""}
                      </span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-xs text-slate-500 mb-1">
                      {proj.technologies.join(" · ")}
                    </p>
                  )}
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
          <section key="skills" className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <h2 className="font-semibold text-slate-400 uppercase tracking-widest text-xs" style={{ fontSize: headingSize }}>
              Skills
            </h2>
            <div className="md:col-span-3 text-slate-800 text-sm leading-relaxed">
              {skills.map((s) => s.name).join("  /  ")}
            </div>
          </section>
        );

      case "certifications":
        if (!certifications || certifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <h2 className="font-semibold text-slate-400 uppercase tracking-widest text-xs" style={{ fontSize: headingSize }}>
              Credentials
            </h2>
            <div className="md:col-span-3 space-y-1 text-sm text-slate-700">
              {certifications.map((c) => (
                <div key={c.id}>
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  {c.issuer ? ` · ${c.issuer}` : ""}
                  {c.date ? ` (${c.date})` : ""}
                </div>
              ))}
            </div>
          </section>
        );

      case "languages":
        if (!languages || languages.length === 0) return null;
        return (
          <section key="languages" className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <h2 className="font-semibold text-slate-400 uppercase tracking-widest text-xs" style={{ fontSize: headingSize }}>
              Languages
            </h2>
            <div className="md:col-span-3 text-sm text-slate-700">
              {languages.map((l) => `${l.language} (${l.proficiency})`).join("  ·  ")}
            </div>
          </section>
        );

      case "customSections":
        if (!customSections || customSections.length === 0) return null;
        return (
          <React.Fragment key="customSections">
            {customSections.map((sec) => (
              <section key={sec.id} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <h2 className="font-semibold text-slate-400 uppercase tracking-widest text-xs" style={{ fontSize: headingSize }}>
                  {sec.title}
                </h2>
                <div className="md:col-span-3 space-y-2">
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        {item.date && <span className="text-xs text-slate-400 font-mono">{item.date}</span>}
                      </div>
                      {item.subtitle && <p className="text-xs text-slate-500 italic">{item.subtitle}</p>}
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
      className="bg-white text-slate-900 p-8 md:p-14 w-full max-w-[800px] mx-auto min-h-[1050px] shadow-sm"
      style={{ fontFamily, fontSize }}
    >
      {/* Clean Minimal Header */}
      <header className="mb-8">
        <h1 className="font-medium tracking-tight text-slate-900 mb-1" style={{ fontSize: nameSize, color: accentColor }}>
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {personalInfo.jobTitle && (
          <p className="text-slate-500 text-sm font-normal mb-2">{personalInfo.jobTitle}</p>
        )}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
        </div>
      </header>

      {/* Ordered Sections with Left Label Column */}
      <div>{sectionOrder.map((secId) => renderSection(secId))}</div>
    </div>
  );
}
