import { NextRequest, NextResponse } from "next/server";
import { ResumeData, SkillItem, ExperienceItem } from "@/src/types/resume";
import mammoth from "mammoth";

export const runtime = "nodejs";

const COMMON_TECH_KEYWORDS = [
  "react", "react.js", "next.js", "vue", "angular", "typescript", "javascript", "python",
  "java", "c++", "c#", "go", "golang", "rust", "node.js", "express", "sql",
  "postgresql", "mongodb", "redis", "mysql", "snowflake", "graphql", "rest api",
  "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "terraform", "git",
  "linux", "microservices", "tailwind", "jest", "cypress", "playwright",
  "agile", "scrum", "jira", "tableau", "power bi", "machine learning", "pandas",
  "numpy", "pytorch", "tensorflow", "etl", "data modeling", "system design",
  "kafka", "rabbitmq", "spring boot", "django", "fastapi", "elasticsearch"
];

function isPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  const headerSlice = buffer.subarray(0, Math.min(buffer.length, 1024));
  return headerSlice.includes(Buffer.from("%PDF"));
}

function isDocxBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
}

function matchesKeyword(text: string, kw: string): boolean {
  try {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefix = /^\w/.test(kw) ? "\\b" : "(?:^|\\s|[^\\w])";
    const suffix = /\w$/.test(kw) ? "\\b" : "(?:$|\\s|[^\\w])";
    const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");
    return regex.test(text);
  } catch {
    return text.toLowerCase().includes(kw.toLowerCase());
  }
}

export async function POST(req: NextRequest) {
  try {
    let jobText = "";
    let resumeData: ResumeData | null = null;
    let targetRole = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const rawResumeData = formData.get("resumeData") as string | null;
      const rawRole = formData.get("targetRole") as string | null;

      if (rawResumeData) {
        try {
          resumeData = JSON.parse(rawResumeData);
        } catch {}
      }
      if (rawRole) {
        targetRole = rawRole.trim();
      }

      if (file && file instanceof File && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = (file.name || "").toLowerCase();

        if (fileName.endsWith(".pdf") || isPdfBuffer(buffer)) {
          const { extractText } = await import("unpdf");
          const res = await extractText(new Uint8Array(buffer), { mergePages: true });
          jobText = (res?.text || "").trim();
        } else if (fileName.endsWith(".docx") || isDocxBuffer(buffer)) {
          const res = await mammoth.extractRawText({ buffer });
          jobText = (res?.value || "").trim();
        } else {
          // Plain text / markdown
          jobText = buffer.toString("utf-8").trim();
        }
      } else {
        const rawText = formData.get("jobText") as string | null;
        if (rawText) jobText = rawText.trim();
      }
    } else {
      const body = await req.json();
      jobText = (body.jobText || "").trim();
      resumeData = body.resumeData || null;
      targetRole = (body.targetRole || "").trim();
    }

    if (!jobText || jobText.length < 20) {
      return NextResponse.json(
        { message: "Please provide a job description with at least 20 characters or upload a valid job posting file." },
        { status: 400 }
      );
    }

    if (!resumeData) {
      return NextResponse.json(
        { message: "Resume data is required to run the tailoring engine." },
        { status: 400 }
      );
    }

    // 1. Analyze Job Description & Extract Target Role
    const lowerJob = jobText.toLowerCase();

    if (!targetRole) {
      // Infer title from job description first 300 chars
      const titleMatch =
        jobText.match(/(?:title|role|position|seeking a|hiring a|looking for a|job title):\s*([A-Za-z0-9\s/–-]{3,40})/i) ||
        jobText.match(/\b(Senior|Staff|Lead|Principal|Junior)?\s*(Full[\s-]Stack|Frontend|Backend|Software|Data|DevOps|Cloud|ML|AI|Product|Project|Security)\s*(Engineer|Developer|Scientist|Architect|Manager|Analyst)\b/i);

      if (titleMatch) {
        targetRole = titleMatch[1] || titleMatch[0];
      } else {
        targetRole = resumeData.personalInfo?.jobTitle || "Software Professional";
      }
      targetRole = targetRole.replace(/^(a|an|the)\s+/i, "").trim();
    }

    // 2. Identify Job Keywords
    const jobKeywordsSet = new Set<string>();
    for (const kw of COMMON_TECH_KEYWORDS) {
      if (matchesKeyword(lowerJob, kw)) {
        jobKeywordsSet.add(kw);
      }
    }

    // Collect all words and phrases from candidate resume
    const candidateSkills = (resumeData.skills || []).map((s) => s.name.toLowerCase());
    const resumeTextBlob = [
      resumeData.personalInfo?.jobTitle || "",
      resumeData.summary || "",
      ...candidateSkills,
      ...(resumeData.experience || []).flatMap((e) => [
        e.position,
        e.company,
        e.description,
        ...(e.highlights || []),
      ]),
      ...(resumeData.projects || []).flatMap((p) => [
        p.title,
        p.description,
        ...(p.technologies || []),
      ]),
    ]
      .join(" ")
      .toLowerCase();

    // 3. Gap Analysis
    const jobKeywordsList = Array.from(jobKeywordsSet);
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const kw of jobKeywordsList) {
      if (matchesKeyword(resumeTextBlob, kw)) {
        matchedSkills.push(kw);
      } else {
        missingSkills.push(kw);
      }
    }

    const matchScore =
      jobKeywordsList.length > 0
        ? Math.min(100, Math.max(35, Math.round((matchedSkills.length / jobKeywordsList.length) * 100)))
        : 85;

    // Detect Seniority
    let seniority = "Mid-Level";
    if (/lead|principal|staff|director|head of/i.test(jobText)) {
      seniority = "Staff / Principal";
    } else if (/senior|sr\./i.test(jobText)) {
      seniority = "Senior";
    } else if (/junior|entry|intern|fresh/i.test(jobText)) {
      seniority = "Junior / Associate";
    }

    // 4. Tailoring Engine: Professional Summary & Experience Bullets
    const groqApiKey = process.env.GROQ_API_KEY;
    let tailoredSummary = "";
    let summaryReason = "";
    const bulletDiffs: Array<{
      id: string;
      company: string;
      position: string;
      original: string;
      tailored: string;
      reason: string;
    }> = [];

    if (groqApiKey) {
      try {
        const aiPrompt = `You are an elite executive resume writer and ATS optimization specialist.
You are tailoring a candidate's resume for the role: "${targetRole}".

TARGET ROLE: ${targetRole}
JOB DESCRIPTION HIGHLIGHTS:
${jobText.slice(0, 1500)}

CANDIDATE'S CURRENT SUMMARY:
"${resumeData.summary || "Experienced software engineer with expertise in building scalable applications."}"

CANDIDATE'S RECENT EXPERIENCE BULLETS:
${(resumeData.experience || [])
  .slice(0, 3)
  .flatMap((e) =>
    (e.highlights && e.highlights.length > 0 ? e.highlights : [e.description])
      .slice(0, 2)
      .map((b) => `- [${e.company} | ${e.position}]: ${b}`)
  )
  .join("\n")}

MATCHED SKILLS TO EMPHASIZE:
${matchedSkills.slice(0, 10).join(", ")}

STRICT RULES (ANTI-HALLUCINATION GUARANTEE):
1. NEVER invent or fabricate past employers, dates, degrees, certifications, or false metrics.
2. Only rewrite the candidate's ACTUAL accomplishments using strong past-tense action verbs (e.g. 'Architected', 'Spearheaded', 'Optimized', 'Engineered') in STAR/CAR format.
3. Align wording and technology mentions with the target role and matched keywords.
4. Provide a JSON response with:
   - "tailoredSummary": string (punchy 2-3 sentences highlighting candidate's proven strengths for this target role)
   - "summaryReason": string (brief explanation of why this summary appeals to the target hiring manager)
   - "bulletDiffs": array of objects:
     - "original": string (the exact original bullet)
     - "tailored": string (the optimized STAR bullet)
     - "reason": string (why this modification improves ATS scoring and recruiter engagement)
`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You tailor resumes to job descriptions. You NEVER fabricate false credentials or metrics. Return valid JSON only.",
              },
              { role: "user", content: aiPrompt },
            ],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          }),
        });

        if (groqRes.ok) {
          const aiJson = await groqRes.json();
          const content = aiJson.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            if (parsed.tailoredSummary) {
              tailoredSummary = parsed.tailoredSummary;
              summaryReason = parsed.summaryReason || `Emphasizes relevant skills for ${targetRole}.`;
            }
            if (Array.isArray(parsed.bulletDiffs)) {
              for (const item of parsed.bulletDiffs) {
                if (item.original && item.tailored) {
                  bulletDiffs.push({
                    id: Math.random().toString(36).substring(2, 9),
                    company: "",
                    position: targetRole,
                    original: item.original,
                    tailored: item.tailored,
                    reason: item.reason || "Aligned with target job keywords and STAR format.",
                  });
                }
              }
            }
          }
        }
      } catch (groqErr) {
        console.warn("Groq tailoring failed, falling back to algorithmic engine:", groqErr);
      }
    }

    // Algorithmic Fallback if AI was absent or returned empty
    if (!tailoredSummary) {
      const topMatched = matchedSkills.slice(0, 5).join(", ");
      const candidateName = resumeData.personalInfo?.fullName || "Results-driven professional";
      tailoredSummary = `${candidateName} offering demonstrated expertise in ${topMatched || "modern technologies"}. Proven track record designing, engineering, and scaling robust solutions aligned with high-impact objectives for ${targetRole} positions.`;
      summaryReason = `Strategically foregrounds matched competencies (${topMatched}) for the ${targetRole} opening.`;
    }

    if (bulletDiffs.length === 0) {
      // Build algorithmic STAR diffs from experience
      for (const exp of (resumeData.experience || []).slice(0, 3)) {
        const bullets = exp.highlights && exp.highlights.length > 0 ? exp.highlights : [exp.description];
        for (const b of bullets.slice(0, 2)) {
          if (!b || b.length < 15) continue;
          let polished = b.replace(/^[•\-\*]\s*/, "").trim();
          // Transform passive to active STAR opening
          if (!/^(architected|spearheaded|engineered|orchestrated|optimized|developed|built|streamlined)/i.test(polished)) {
            polished = `Spearheaded execution of ${polished.charAt(0).toLowerCase() + polished.slice(1)}`;
          }
          if (!/[.!?]$/.test(polished)) polished += ".";

          bulletDiffs.push({
            id: Math.random().toString(36).substring(2, 9),
            company: exp.company,
            position: exp.position,
            original: b,
            tailored: polished,
            reason: `Rewritten into commanding past-tense STAR format to highlight ownership.`,
          });
        }
      }
    }

    // 5. Build the Tailored Clone Resume Data
    const updatedExperience: ExperienceItem[] = (resumeData.experience || []).map((exp) => {
      const updatedHighlights = (exp.highlights || []).map((h) => {
        const diff = bulletDiffs.find((d) => d.original === h);
        return diff ? diff.tailored : h;
      });

      let updatedDesc = exp.description;
      const descDiff = bulletDiffs.find((d) => d.original === exp.description);
      if (descDiff) updatedDesc = descDiff.tailored;

      return {
        ...exp,
        description: updatedDesc,
        highlights: updatedHighlights,
      };
    });

    // Reorder skills to elevate matched skills to the top
    const reorderedSkills: SkillItem[] = [...(resumeData.skills || [])].sort((a, b) => {
      const aMatch = matchedSkills.includes(a.name.toLowerCase()) ? 1 : 0;
      const bMatch = matchedSkills.includes(b.name.toLowerCase()) ? 1 : 0;
      return bMatch - aMatch;
    });

    const tailoredResumeData: ResumeData = {
      ...resumeData,
      title: `${resumeData.personalInfo?.fullName || "Candidate"} — ${targetRole} Resume`,
      targetRole,
      jobDescription: jobText.substring(0, 600),
      summary: tailoredSummary,
      experience: updatedExperience,
      skills: reorderedSkills,
      baseResumeId: resumeData._id || resumeData.id,
      tailoredFromId: resumeData._id || resumeData.id,
    };

    return NextResponse.json({
      success: true,
      analysis: {
        targetRole,
        seniority,
        matchScore,
        matchedSkills,
        missingSkills,
        jobKeywords: jobKeywordsList,
      },
      diffs: {
        summary: {
          original: resumeData.summary || "",
          tailored: tailoredSummary,
          reason: summaryReason,
        },
        bullets: bulletDiffs,
      },
      tailoredResume: tailoredResumeData,
    });
  } catch (error: any) {
    console.error("JOB_TAILOR_ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to tailor resume to job description." },
      { status: 500 }
    );
  }
}
