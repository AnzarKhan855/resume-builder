import React from "react";
import { ResumeData } from "@/src/types/resume";

export default function TechnicalTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements, languages, customSections, sectionOrder, customization } = data;

  const accentColor = customization?.accentColor || "#0284c7";
  const fontFamily = customization?.fontFamily || "var(--font-geist-sans), sans-serif";
  const fontSize = customization?.fontSize === "sm" ? "12.5px" : customization?.fontSize === "lg" ? "14.5px" : "13.5px";
  const headingSize = customization?.fontSize === "sm" ? "14px" : customization?.fontSize === "lg" ? "17px" : "15px";
  const nameSize = customization?.fontSize === "sm" ? "24px" : customization?.fontSize === "lg" ? "30px" : "26px";

  // Group skills by category if available
  const skillCategories: { [cat: string]: string[] } = {};
  skills.forEach((s) => {
    const cat = s.category || "General";
    if (!skillCategories[cat]) skillCategories[cat] = [];
    skillCategories[cat].push(s.name);
  });

  const renderSection = (secId: string) => {
    switch (secId) {
      case "summary":
        if (!summary) return null;
        return (
          <section key="summary" className="mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                {"// 01"}
              </span>
              <h2 className="font-bold text-slate-900 uppercase tracking-wider" style={{ fontSize: headingSize }}>
                About & Impact
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">{summary}</p>
          </section>
        );

      case "skills":
        if (!skills || skills.length === 0) return null;
        return (
          <section key="skills" className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                {"// 02"}
              </span>
              <h2 className="font-bold text-slate-900 uppercase tracking-wider" style={{ fontSize: headingSize }}>
                Technical Skills & Tools
              </h2>
            </div>
            <div className="space-y-1.5 text-sm bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              {Object.entries(skillCategories).map(([category, items]) => (
                <div key={category} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-600 min-w-[110px] uppercase">
                    {category}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "experience":
        if (!experience || experience.length === 0) return null;
        return (
          <section key="experience" className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                {"// 03"}
              </span>
              <h2 className="font-bold text-slate-900 uppercase tracking-wider" style={{ fontSize: headingSize }}>
                Engineering Experience
              </h2>
            </div>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{exp.position}</h3>
                      <span className="text-slate-500 text-xs">@</span>
                      <span className="font-semibold text-slate-800 text-sm">{exp.company}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      [{exp.startDate} – {exp.current ? "Present" : exp.endDate}]
                    </span>
                  </div>
                  {exp.location && <p className="text-xs text-slate-500 font-mono mb-1">{exp.location}</p>}
                  {exp.description && (
                    <p className="text-slate-700 text-xs whitespace-pre-line leading-relaxed mb-1">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-slate-700 text-xs space-y-0.5">
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

      case "projects":
        if (!projects || projects.length === 0) return null;
        return (
          <section key="projects" className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                {"// 04"}
              </span>
              <h2 className="font-bold text-slate-900 uppercase tracking-wider" style={{ fontSize: headingSize }}>
                Projects & Open Source
              </h2>
            </div>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="border-l-2 pl-3" style={{ borderColor: accentColor }}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {proj.title}
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs ml-2 text-sky-600 hover:underline"
                        >
                          [{proj.link.replace(/^https?:\/\//, "")}]
                        </a>
                      )}
                      {proj.github && (
                        <span className="font-mono text-xs text-slate-500 ml-2">
                          [gh: {proj.github.replace(/^https?:\/\/github\.com\//, "")}]
                        </span>
                      )}
                    </h3>
                    {proj.startDate && (
                      <span className="font-mono text-xs text-slate-500">
                        {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ""}
                      </span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {proj.technologies.map((t, i) => (
                        <span key={i} className="text-xs font-mono px-1 bg-slate-100 text-slate-700 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-slate-700 text-xs whitespace-pre-line leading-relaxed">
                      {proj.description}
                    </p>
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
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                {"// 05"}
              </span>
              <h2 className="font-bold text-slate-900 uppercase tracking-wider" style={{ fontSize: headingSize }}>
                Education
              </h2>
            </div>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline flex-wrap">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                    </h3>
                    <p className="text-slate-600 text-xs">
                      {edu.institution} {edu.location ? `· ${edu.location}` : ""}
                    </p>
                    {edu.gpa && <p className="text-xs font-mono text-slate-500 mt-0.5">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (!certifications || certifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                {"// 06"}
              </span>
              <h2 className="font-bold text-slate-900 uppercase tracking-wider" style={{ fontSize: headingSize }}>
                Certifications
              </h2>
            </div>
            <div className="space-y-1 text-xs text-slate-700 font-mono">
              {certifications.map((c) => (
                <div key={c.id}>
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  {c.issuer ? ` [${c.issuer}]` : ""}
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                {"// 07"}
              </span>
              <h2 className="font-bold text-slate-900 uppercase tracking-wider" style={{ fontSize: headingSize }}>
                Languages
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-700 font-mono">
              {languages.map((l) => (
                <span key={l.id}>
                  {l.language}: {l.proficiency}
                </span>
              ))}
            </div>
          </section>
        );

      case "customSections":
        if (!customSections || customSections.length === 0) return null;
        return (
          <React.Fragment key="customSections">
            {customSections.map((sec, idx) => (
              <section key={sec.id} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>
                    {"// 0"}{8 + idx}
                  </span>
                  <h2 className="font-bold text-slate-900 uppercase tracking-wider" style={{ fontSize: headingSize }}>
                    {sec.title}
                  </h2>
                </div>
                <div className="space-y-2">
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                        {item.date && <span className="text-xs font-mono text-slate-500">{item.date}</span>}
                      </div>
                      {item.subtitle && <p className="text-xs text-slate-500 italic">{item.subtitle}</p>}
                      <p className="text-xs text-slate-700">{item.description}</p>
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
      className="bg-white text-slate-900 p-8 md:p-12 w-full max-w-[800px] mx-auto min-h-[1050px] shadow-sm border-t-4"
      style={{ fontFamily, fontSize, borderTopColor: accentColor }}
    >
      {/* Tech Header */}
      <header className="mb-6 pb-4 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-black tracking-tight text-slate-900" style={{ fontSize: nameSize }}>
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            {personalInfo.jobTitle && (
              <p className="font-mono text-sm font-semibold tracking-tight" style={{ color: accentColor }}>
                &gt; {personalInfo.jobTitle}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono text-slate-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>· {personalInfo.phone}</span>}
            {personalInfo.location && <span>· {personalInfo.location}</span>}
            {personalInfo.github && <span>· gh:{personalInfo.github}</span>}
            {personalInfo.linkedin && <span>· in:{personalInfo.linkedin}</span>}
          </div>
        </div>
      </header>

      {/* Ordered Sections */}
      <div>{sectionOrder.map((secId) => renderSection(secId))}</div>
    </div>
  );
}
