"use client";

import React from "react";
import { ResumeData } from "@/src/types/resume";
import { getTemplateById, TemplateDefinition } from "@/src/lib/templates-registry";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function DynamicTemplateRenderer({ data }: { data: ResumeData }) {
  const templateDef: TemplateDefinition = getTemplateById(data.template);
  const isAtsMode = Boolean(data.isAtsMode);

  // Customization overrides
  const customization = data.customization || {};
  const accentColor = isAtsMode
    ? "#0f172a"
    : customization.accentColor || templateDef.recommendedColor || "#1e3a8a";
  const fontFamily = isAtsMode
    ? "Inter, Arial, sans-serif"
    : customization.fontFamily || templateDef.fontFamily;
  const headingStyle = isAtsMode ? "uppercase" : customization.headingStyle || "uppercase";

  // Section order
  const sectionOrder = data.sectionOrder && data.sectionOrder.length > 0
    ? data.sectionOrder
    : [
        "personalInfo",
        "summary",
        "experience",
        "education",
        "projects",
        "skills",
        "certifications",
        "achievements",
        "awards",
        "interests",
        "languages",
        "publications",
        "volunteer",
        "coursework",
        "customSections",
      ];

  // Helper for Section Headings
  const renderHeading = (title: string) => {
    if (isAtsMode) {
      return (
        <div className="border-b-2 border-slate-900 pb-1 mb-3 mt-5">
          <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
            {title}
          </h2>
        </div>
      );
    }

    switch (templateDef.headingStyle) {
      case "left-accent":
        return (
          <div className="flex items-center gap-2 mb-3 mt-5 border-b border-slate-200 pb-1">
            <span
              className="w-1.5 h-4 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <h2
              className="text-sm font-bold tracking-wide"
              style={{
                color: accentColor,
                textTransform: headingStyle === "uppercase" ? "uppercase" : "capitalize",
              }}
            >
              {title}
            </h2>
          </div>
        );

      case "pill-tag":
        return (
          <div className="flex items-center gap-2 mb-3 mt-5">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md text-white"
              style={{ backgroundColor: accentColor }}
            >
              {title}
            </span>
            <div className="grow h-px bg-slate-200" />
          </div>
        );

      case "monospace-bracket":
        return (
          <div className="border-b border-slate-300 pb-1 mb-3 mt-5 font-mono text-xs">
            <h2 className="font-bold tracking-wider text-slate-900">
              <span style={{ color: accentColor }}>{"// "}</span>
              {title.toUpperCase()}
            </h2>
          </div>
        );

      case "plain-caps":
        return (
          <div className="border-b border-slate-300 pb-1 mb-3 mt-5">
            <h2 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
              {title}
            </h2>
          </div>
        );

      case "underlined":
      default:
        return (
          <div
            className="border-b-2 pb-1 mb-3 mt-5"
            style={{ borderColor: accentColor }}
          >
            <h2
              className="text-sm font-bold tracking-wider"
              style={{
                color: accentColor,
                textTransform: headingStyle === "uppercase" ? "uppercase" : "capitalize",
              }}
            >
              {title}
            </h2>
          </div>
        );
    }
  };

  // Header Renderer
  const renderHeader = () => {
    const { fullName, jobTitle, email, phone, location, linkedin, github, website } =
      data.personalInfo || {};

    if (isAtsMode) {
      return (
        <header className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
            {fullName || "Candidate Name"}
          </h1>
          {jobTitle && (
            <p className="text-sm font-medium text-slate-700 mt-1">{jobTitle}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-2">
            {email && <span>{email}</span>}
            {phone && <span>• {phone}</span>}
            {location && <span>• {location}</span>}
            {linkedin && <span>• {linkedin}</span>}
            {github && <span>• {github}</span>}
            {website && <span>• {website}</span>}
          </div>
        </header>
      );
    }

    if (templateDef.headerStyle === "bold-band") {
      return (
        <header
          className="-mx-8 -mt-8 p-8 mb-6 text-white rounded-t-sm"
          style={{ backgroundColor: accentColor }}
        >
          <h1 className="text-2xl font-black tracking-tight uppercase">
            {fullName || "Candidate Name"}
          </h1>
          {jobTitle && (
            <p className="text-sm font-medium text-slate-100 mt-1">{jobTitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-100 mt-4 opacity-90">
            {email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {email}
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {phone}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {location}
              </span>
            )}
            {linkedin && (
              <span className="flex items-center gap-1">
                <LinkedinIcon className="w-3.5 h-3.5" /> {linkedin}
              </span>
            )}
            {github && (
              <span className="flex items-center gap-1">
                <GithubIcon className="w-3.5 h-3.5" /> {github}
              </span>
            )}
          </div>
        </header>
      );
    }

    if (templateDef.headerStyle === "technical-mono") {
      return (
        <header className="border-b border-slate-200 pb-4 mb-5 font-mono">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              <span style={{ color: accentColor }}>&gt; </span>
              {fullName || "Candidate Name"}
            </h1>
            {jobTitle && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800"
                style={{ color: accentColor }}
              >
                [{jobTitle}]
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
            {email && <span>email: {email}</span>}
            {phone && <span>tel: {phone}</span>}
            {location && <span>loc: {location}</span>}
            {github && <span>git: {github}</span>}
            {linkedin && <span>in: {linkedin}</span>}
          </div>
        </header>
      );
    }

    if (templateDef.headerStyle === "centered") {
      return (
        <header className="border-b border-slate-200 pb-4 mb-5 text-center">
          <h1
            className="text-2xl font-bold tracking-tight text-slate-900 uppercase"
            style={{ color: accentColor }}
          >
            {fullName || "Candidate Name"}
          </h1>
          {jobTitle && (
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">
              {jobTitle}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2.5">
            {email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" /> {email}
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {phone}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {location}
              </span>
            )}
            {linkedin && (
              <span className="flex items-center gap-1">
                <LinkedinIcon className="w-3 h-3 text-slate-400" /> {linkedin}
              </span>
            )}
            {github && (
              <span className="flex items-center gap-1">
                <GithubIcon className="w-3 h-3 text-slate-400" /> {github}
              </span>
            )}
          </div>
        </header>
      );
    }

    // Default: Left-aligned clean
    return (
      <header className="border-b border-slate-200 pb-4 mb-5">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight text-slate-900"
              style={{ color: accentColor }}
            >
              {fullName || "Candidate Name"}
            </h1>
            {jobTitle && (
              <p className="text-sm font-medium text-slate-600 mt-0.5">{jobTitle}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2.5">
          {email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> {email}
            </span>
          )}
          {phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" /> {phone}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> {location}
            </span>
          )}
          {linkedin && (
            <span className="flex items-center gap-1">
              <LinkedinIcon className="w-3 h-3 text-slate-400" /> {linkedin}
            </span>
          )}
          {github && (
            <span className="flex items-center gap-1">
              <GithubIcon className="w-3 h-3 text-slate-400" /> {github}
            </span>
          )}
        </div>
      </header>
    );
  };

  // Section Renders
  const renderSection = (secKey: string) => {
    switch (secKey) {
      case "summary":
        if (!data.summary) return null;
        return (
          <section key="summary" className="mb-4">
            {renderHeading("Professional Summary")}
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
              {data.summary}
            </p>
          </section>
        );

      case "experience":
        if (!data.experience || data.experience.length === 0) return null;
        return (
          <section key="experience" className="mb-4">
            {renderHeading("Work Experience")}
            <div className="space-y-3.5">
              {data.experience.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {exp.position}
                    </span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      {exp.location ? ` | ${exp.location}` : ""}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-700 mb-1">
                    {exp.company}
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 leading-relaxed mb-1 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-600">
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
        if (!data.education || data.education.length === 0) return null;
        return (
          <section key="education" className="mb-4">
            {renderHeading("Education")}
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                    </span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium">
                    {edu.institution} {edu.location ? `— ${edu.location}` : ""}
                    {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "projects":
        if (!data.projects || data.projects.length === 0) return null;
        return (
          <section key="projects" className="mb-4">
            {renderHeading("Key Projects")}
            <div className="space-y-3">
              {data.projects.map((proj) => (
                <div key={proj.id} className="text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {proj.title}
                    </span>
                    {proj.link && (
                      <span className="text-[11px] text-blue-600 underline">
                        {proj.link}
                      </span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      Technologies: {proj.technologies.join(", ")}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-slate-600 leading-relaxed mt-1 whitespace-pre-line">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "skills":
        if (!data.skills || data.skills.length === 0) return null;
        return (
          <section key="skills" className="mb-4">
            {renderHeading("Technical & Core Skills")}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {data.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-2 py-0.5 rounded text-slate-800 bg-slate-100 border border-slate-200/80 font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (!data.certifications || data.certifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-4">
            {renderHeading("Certifications & Licenses")}
            <div className="space-y-1.5 text-xs">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex items-baseline justify-between">
                  <span className="font-semibold text-slate-800">• {cert.name}</span>
                  <span className="text-slate-500 text-[11px]">
                    {cert.issuer} {cert.date ? `(${cert.date})` : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );

      case "achievements":
        if (!data.achievements || data.achievements.length === 0) return null;
        return (
          <section key="achievements" className="mb-4">
            {renderHeading("Honors & Key Achievements")}
            <div className="space-y-1.5 text-xs">
              {data.achievements.map((ach) => (
                <div key={ach.id}>
                  <span className="font-semibold text-slate-800">• {ach.title}</span>
                  {ach.description && (
                    <p className="text-slate-600 ml-3 text-[11px]">{ach.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "languages":
        if (!data.languages || data.languages.length === 0) return null;
        return (
          <section key="languages" className="mb-4">
            {renderHeading("Languages")}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {data.languages.map((lang) => (
                <span key={lang.id} className="text-slate-700">
                  <strong className="text-slate-900">{lang.language}</strong> ({lang.proficiency})
                </span>
              ))}
            </div>
          </section>
        );

      case "publications":
        if (!data.publications || data.publications.length === 0) return null;
        return (
          <section key="publications" className="mb-4">
            {renderHeading("Publications & Research")}
            <div className="space-y-2 text-xs">
              {data.publications.map((pub) => (
                <div key={pub.id}>
                  <div className="font-semibold text-slate-800">
                    • &ldquo;{pub.title}&rdquo; {pub.publisher ? `— ${pub.publisher}` : ""} {pub.date ? `(${pub.date})` : ""}
                  </div>
                  {pub.description && pub.description !== pub.title && (
                    <p className="text-slate-600 ml-3 text-[11px]">{pub.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "volunteer":
        if (!data.volunteer || data.volunteer.length === 0) return null;
        return (
          <section key="volunteer" className="mb-4">
            {renderHeading("Volunteer & Community Involvement")}
            <div className="space-y-2 text-xs">
              {data.volunteer.map((vol) => (
                <div key={vol.id}>
                  <div className="flex items-baseline justify-between font-semibold text-slate-800">
                    <span>{vol.role} — {vol.organization}</span>
                    <span className="text-slate-500 text-[11px]">
                      {vol.startDate} {vol.endDate ? `– ${vol.endDate}` : ""}
                    </span>
                  </div>
                  {vol.description && (
                    <p className="text-slate-600 text-[11px] mt-0.5">{vol.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "coursework":
        if (!data.coursework || data.coursework.length === 0) return null;
        return (
          <section key="coursework" className="mb-4">
            {renderHeading("Relevant Coursework")}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {data.coursework.map((course) => (
                <span
                  key={course.id}
                  className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px]"
                >
                  {course.name}
                </span>
              ))}
            </div>
          </section>
        );

      case "customSections":
        if (!data.customSections || data.customSections.length === 0) return null;
        return (
          <React.Fragment key="customSections">
            {data.customSections.map((sec) => (
              <section key={sec.id} className="mb-4">
                {renderHeading(sec.title)}
                <div className="space-y-2 text-xs">
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div className="flex items-baseline justify-between font-semibold text-slate-800">
                        <span>{item.title}</span>
                        {item.date && <span className="text-slate-500 text-[11px]">{item.date}</span>}
                      </div>
                      {item.subtitle && (
                        <div className="text-slate-600 text-[11px]">{item.subtitle}</div>
                      )}
                      {item.description && (
                        <p className="text-slate-600 text-[11px] mt-0.5 whitespace-pre-line">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </React.Fragment>
        );

      case "awards":
        if (!data.awards || data.awards.length === 0) return null;
        return (
          <section key="awards" className="mb-4">
            {renderHeading("Honors & Awards")}
            <div className="space-y-2 text-xs">
              {data.awards.map((award) => (
                <div key={award.id}>
                  <div className="flex items-baseline justify-between font-semibold text-slate-800">
                    <span>• {award.title} {award.issuer ? `— ${award.issuer}` : ""}</span>
                    {award.date && <span className="text-slate-500 text-[11px] ml-2 shrink-0">{award.date}</span>}
                  </div>
                  {award.description && (
                    <p className="text-slate-600 ml-3 text-[11px] mt-0.5">{award.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "interests":
        if (!data.interests || data.interests.length === 0) return null;
        return (
          <section key="interests" className="mb-4">
            {renderHeading("Interests & Activities")}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {data.interests.map((interest) => (
                <span
                  key={interest.id}
                  className="px-2 py-0.5 rounded text-slate-700 bg-slate-100 border border-slate-200/80 font-medium text-[11px]"
                >
                  {interest.name}
                </span>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const isLeftRail = templateDef.layoutStyle === "left-rail" && !isAtsMode;
  const isCompact = templateDef.layoutStyle === "compact";

  if (isLeftRail) {
    const sidebarKeys = new Set([
      "skills",
      "education",
      "certifications",
      "languages",
      "awards",
      "interests",
      "coursework",
    ]);

    const leftSections = sectionOrder.filter((k) => sidebarKeys.has(k));
    const mainSections = sectionOrder.filter((k) => !sidebarKeys.has(k) && k !== "personalInfo");

    return (
      <div
        className="w-full bg-white text-slate-900 p-8 shadow-sm transition-all"
        style={{ fontFamily }}
      >
        {renderHeader()}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          <aside className="md:col-span-4 space-y-1 border-r border-slate-200 pr-5">
            {leftSections.map((key) => renderSection(key))}
          </aside>
          <main className="md:col-span-8 space-y-1">
            {mainSections.map((key) => renderSection(key))}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-white text-slate-900 ${
        isCompact ? "p-6 text-[11px] leading-snug" : "p-8 text-xs leading-normal"
      } shadow-sm transition-all`}
      style={{ fontFamily }}
    >
      {renderHeader()}
      <main className={isCompact ? "space-y-0.5" : "space-y-1"}>
        {sectionOrder.map((key) => renderSection(key))}
      </main>
    </div>
  );
}
