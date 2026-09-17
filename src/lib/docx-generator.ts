import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import { ResumeData } from "@/src/types/resume";

export function createDocxDocument(data: ResumeData): Document {
  const { personalInfo, summary, experience, education, projects, skills, certifications, achievements, languages, publications, volunteer, coursework, customSections } = data;

  const children: Paragraph[] = [];

  // 1. Header
  // Candidate Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: (personalInfo?.fullName || "Candidate Name").toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: "Arial",
          color: "111827",
        }),
      ],
    })
  );

  // Job Title
  if (personalInfo?.jobTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: personalInfo.jobTitle,
            size: 22, // 11pt
            font: "Arial",
            color: "4B5563",
          }),
        ],
      })
    );
  }

  // Contact line
  const contactParts: string[] = [];
  if (personalInfo?.email) contactParts.push(personalInfo.email);
  if (personalInfo?.phone) contactParts.push(personalInfo.phone);
  if (personalInfo?.location) contactParts.push(personalInfo.location);
  if (personalInfo?.linkedin) contactParts.push(personalInfo.linkedin);
  if (personalInfo?.github) contactParts.push(personalInfo.github);
  if (personalInfo?.website) contactParts.push(personalInfo.website);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            size: 18, // 9pt
            font: "Arial",
            color: "4B5563",
          }),
        ],
      })
    );
  }

  // Section Heading Helper
  const addSectionHeading = (title: string) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "1F2937",
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: "Arial",
            color: "111827",
          }),
        ],
      })
    );
  };

  // 2. Summary
  if (summary && summary.trim()) {
    addSectionHeading("Professional Summary");
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: summary,
            size: 20, // 10pt
            font: "Arial",
            color: "374151",
          }),
        ],
      })
    );
  }

  // 3. Experience
  if (experience && experience.length > 0) {
    addSectionHeading("Work Experience");
    for (const exp of experience) {
      // Role & Dates
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: exp.position || "Position",
              bold: true,
              size: 20,
              font: "Arial",
              color: "111827",
            }),
            new TextRun({
              text: `    ${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`,
              italics: true,
              size: 18,
              font: "Arial",
              color: "6B7280",
            }),
          ],
        })
      );

      // Company & Location
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: exp.company || "Company",
              bold: true,
              size: 19,
              font: "Arial",
              color: "4B5563",
            }),
            new TextRun({
              text: exp.location ? ` | ${exp.location}` : "",
              size: 18,
              font: "Arial",
              color: "6B7280",
            }),
          ],
        })
      );

      // Description
      if (exp.description) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: exp.description,
                size: 19,
                font: "Arial",
                color: "374151",
              }),
            ],
          })
        );
      }

      // Highlights
      if (exp.highlights && exp.highlights.length > 0) {
        for (const h of exp.highlights) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: h,
                  size: 19,
                  font: "Arial",
                  color: "374151",
                }),
              ],
            })
          );
        }
      }
    }
  }

  // 4. Education
  if (education && education.length > 0) {
    addSectionHeading("Education");
    for (const edu of education) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: `${edu.degree || "Degree"} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}`,
              bold: true,
              size: 20,
              font: "Arial",
              color: "111827",
            }),
            new TextRun({
              text: `    ${edu.startDate || ""} – ${edu.current ? "Present" : edu.endDate || ""}`,
              italics: true,
              size: 18,
              font: "Arial",
              color: "6B7280",
            }),
          ],
        })
      );

      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: edu.institution || "Institution",
              size: 19,
              font: "Arial",
              color: "4B5563",
            }),
            new TextRun({
              text: edu.gpa ? ` | GPA: ${edu.gpa}` : "",
              size: 18,
              font: "Arial",
              color: "6B7280",
            }),
          ],
        })
      );
    }
  }

  // 5. Projects
  if (projects && projects.length > 0) {
    addSectionHeading("Key Projects");
    for (const proj of projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: proj.title || "Project",
              bold: true,
              size: 20,
              font: "Arial",
              color: "111827",
            }),
            new TextRun({
              text: proj.link ? `    (${proj.link})` : "",
              size: 18,
              font: "Arial",
              color: "2563EB",
            }),
          ],
        })
      );

      if (proj.technologies && proj.technologies.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `Technologies: ${proj.technologies.join(", ")}`,
                italics: true,
                size: 18,
                font: "Arial",
                color: "6B7280",
              }),
            ],
          })
        );
      }

      if (proj.description) {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: proj.description,
                size: 19,
                font: "Arial",
                color: "374151",
              }),
            ],
          })
        );
      }
    }
  }

  // 6. Skills
  if (skills && skills.length > 0) {
    addSectionHeading("Technical & Core Skills");
    const skillList = skills.map((s) => s.name).join(", ");
    children.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: skillList,
            size: 19,
            font: "Arial",
            color: "374151",
          }),
        ],
      })
    );
  }

  // 7. Certifications
  if (certifications && certifications.length > 0) {
    addSectionHeading("Certifications");
    for (const cert of certifications) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 19,
              font: "Arial",
              color: "111827",
            }),
            new TextRun({
              text: cert.issuer ? ` — ${cert.issuer}` : "",
              size: 18,
              font: "Arial",
              color: "4B5563",
            }),
            new TextRun({
              text: cert.date ? ` (${cert.date})` : "",
              size: 18,
              font: "Arial",
              color: "6B7280",
            }),
          ],
        })
      );
    }
  }

  // 8. Achievements
  if (achievements && achievements.length > 0) {
    addSectionHeading("Honors & Achievements");
    for (const ach of achievements) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: ach.title,
              bold: true,
              size: 19,
              font: "Arial",
              color: "111827",
            }),
            new TextRun({
              text: ach.description ? ` — ${ach.description}` : "",
              size: 19,
              font: "Arial",
              color: "374151",
            }),
          ],
        })
      );
    }
  }

  // 9. Languages
  if (languages && languages.length > 0) {
    addSectionHeading("Languages");
    const langStr = languages.map((l) => `${l.language} (${l.proficiency})`).join("  •  ");
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: langStr,
            size: 19,
            font: "Arial",
            color: "374151",
          }),
        ],
      })
    );
  }

  // 10. Publications
  if (publications && publications.length > 0) {
    addSectionHeading("Publications");
    for (const pub of publications) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `"${pub.title}"`,
              bold: true,
              size: 19,
              font: "Arial",
              color: "111827",
            }),
            new TextRun({
              text: pub.publisher ? ` — ${pub.publisher}` : "",
              size: 18,
              font: "Arial",
              color: "4B5563",
            }),
            new TextRun({
              text: pub.date ? ` (${pub.date})` : "",
              size: 18,
              font: "Arial",
              color: "6B7280",
            }),
          ],
        })
      );
    }
  }

  // 11. Volunteer
  if (volunteer && volunteer.length > 0) {
    addSectionHeading("Volunteer Experience");
    for (const vol of volunteer) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 30 },
          children: [
            new TextRun({
              text: `${vol.role} — ${vol.organization}`,
              bold: true,
              size: 19,
              font: "Arial",
              color: "111827",
            }),
            new TextRun({
              text: vol.startDate ? `    ${vol.startDate} – ${vol.endDate || "Present"}` : "",
              italics: true,
              size: 18,
              font: "Arial",
              color: "6B7280",
            }),
          ],
        })
      );
      if (vol.description) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: vol.description,
                size: 18,
                font: "Arial",
                color: "4B5563",
              }),
            ],
          })
        );
      }
    }
  }

  // 12. Coursework
  if (coursework && coursework.length > 0) {
    addSectionHeading("Relevant Coursework");
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: coursework.map((c) => c.name).join(", "),
            size: 19,
            font: "Arial",
            color: "374151",
          }),
        ],
      })
    );
  }

  // 13. Custom Sections
  if (customSections && customSections.length > 0) {
    for (const sec of customSections) {
      addSectionHeading(sec.title);
      for (const item of sec.items) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({
                text: item.title,
                bold: true,
                size: 19,
                font: "Arial",
                color: "111827",
              }),
              new TextRun({
                text: item.date ? `    (${item.date})` : "",
                size: 18,
                font: "Arial",
                color: "6B7280",
              }),
            ],
          })
        );
        if (item.subtitle) {
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: item.subtitle,
                  italics: true,
                  size: 18,
                  font: "Arial",
                  color: "4B5563",
                }),
              ],
            })
          );
        }
        if (item.description) {
          children.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: item.description,
                  size: 19,
                  font: "Arial",
                  color: "374151",
                }),
              ],
            })
          );
        }
      }
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch (720 twips)
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });
}

/**
 * Generates and triggers browser download of FirstName-LastName-Resume.docx
 */
export async function downloadResumeDOCX(data: ResumeData): Promise<void> {
  const doc = createDocxDocument(data);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const nameSlug = (data.personalInfo?.fullName || "Candidate")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-");

  a.href = url;
  a.download = `${nameSlug}-Resume.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
