import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, type, context } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { message: "Text content is required for improvement." },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    const groqApiKey = process.env.GROQ_API_KEY;

    // 1. If Groq API Key is configured on the server, attempt high-speed LLM call
    if (groqApiKey) {
      try {
        const systemPrompt = `You are an elite executive resume writer and ATS optimization expert.
Your job is to refine, strengthen, and polish resume content.
CRITICAL RULES:
1. Preserve 100% factual accuracy. NEVER invent or fabricate dates, companies, metrics, degrees, or false claims.
2. If improving a bullet point, begin with a commanding past-tense action verb (e.g., 'Architected', 'Spearheaded', 'Optimized', 'Engineered', 'Accelerated').
3. Keep the tone concise, authoritative, and professional.
4. Return ONLY the improved text directly without any conversational preamble, quotes, or conversational closing.`;

        let userPrompt = "";
        if (type === "improve_bullet") {
          userPrompt = `Improve this resume bullet point for maximum impact and ATS readability:\n"${trimmed}"\nContext: ${context || "Professional experience"}`;
        } else if (type === "refine_summary") {
          userPrompt = `Refine this professional executive summary to be punchy, compelling, and free of fluff (2-3 sentences max):\n"${trimmed}"`;
        } else if (type === "make_concise") {
          userPrompt = `Make this resume text concise and remove redundant filler words while preserving key achievements:\n"${trimmed}"`;
        } else {
          userPrompt = `Polish this resume text for tone, clarity, and grammatical precision:\n"${trimmed}"`;
        }

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 300,
          }),
        });

        if (groqResponse.ok) {
          const result = await groqResponse.json();
          const improved = result.choices?.[0]?.message?.content?.trim();
          if (improved) {
            return NextResponse.json({
              improved: improved.replace(/^["']|["']$/g, ""),
              source: "groq-ai",
            });
          }
        }
      } catch (groqErr) {
        console.warn("Groq AI call failed, falling back to algorithmic improver:", groqErr);
      }
    }

    // 2. High-Quality Algorithmic Text Improver Fallback
    const improved = improveTextAlgorithmically(trimmed, type);

    return NextResponse.json({
      improved,
      source: "algorithmic-improver",
    });
  } catch (error: any) {
    console.error("AI_IMPROVE_ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to improve text." },
      { status: 500 }
    );
  }
}

/**
 * Intelligent algorithmic improver that elevates weak bullet points and summaries
 */
function improveTextAlgorithmically(text: string, _type?: string): string {
  let cleaned = text.replace(/^[•\-\*]\s*/, "").trim();

  // Replace weak passive openings with strong action verbs
  const weakOpenings: [RegExp, string][] = [
    [/^(?:responsible for|handled|helped with|assisted with|worked on)\s+/i, "Orchestrated "],
    [/^(?:helped to build|worked to build)\s+/i, "Engineered "],
    [/^(?:did|performed)\s+/i, "Executed "],
    [/^(?:made|created)\s+/i, "Developed "],
    [/^(?:talked to|communicated with)\s+/i, "Liaised with "],
    [/^(?:looked at|checked)\s+/i, "Audited "],
    [/^(?:changed|switched)\s+/i, "Transitioned "],
    [/^(?:fixed|solved)\s+/i, "Resolved "],
    [/^(?:led the team to)\s+/i, "Spearheaded "],
  ];

  for (const [pattern, replacement] of weakOpenings) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement);
      break;
    }
  }

  // Capitalize first character
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // If bullet doesn't end with punctuation, add period
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}
