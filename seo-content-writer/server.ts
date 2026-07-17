import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Resilient helper function to safely invoke Gemini generateContent with retries and fallback
 * to mitigate transient "503 High Demand / Spikes in demand" and rate limit errors.
 */
async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
}): Promise<any> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing. Please go to the Settings menu (gear icon in the top right) to configure your GEMINI_API_KEY.");
  }

  const maxRetries = 3;
  const initialDelay = 1500; // ms
  
  // Robust collection of fallback models to completely neutralize model-specific load/quota spikes
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini API] Invoking ${model} (Attempt ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);
        console.warn(`[Gemini API WARNING] Attempt ${attempt} failed with model ${model}:`, errMsg);

        // Check if the error is quota or transient rate/load limit
        const isQuota = 
          errMsg.includes("429") || 
          errMsg.includes("RESOURCE_EXHAUSTED") || 
          errMsg.includes("quota exceeded") ||
          errMsg.includes("Quota exceeded");

        const isTransient = 
          isQuota ||
          errMsg.includes("503") || 
          errMsg.includes("UNAVAILABLE") || 
          errMsg.includes("high demand") || 
          errMsg.includes("overloaded") || 
          errMsg.includes("temporary");

        if (isTransient && attempt < maxRetries) {
          // Calculate dynamic wait time or use exponential backoff
          let delay = initialDelay * Math.pow(2, attempt - 1);
          
          // If we can extract the precise retry delay from the Google API error message
          const match = errMsg.match(/retry in\s+([\d\.]+)\s*s/i);
          if (match && match[1]) {
            const extractedSecs = Math.ceil(parseFloat(match[1]));
            console.log(`[Gemini API] Extracted exact rate limit wait time of ${extractedSecs}s from error response.`);
            if (extractedSecs > 0 && extractedSecs <= 10) {
              delay = extractedSecs * 1000;
            } else if (extractedSecs > 10) {
              // If wait is too long, don't sleep to avoid HTTP timeout. Speed up fallback to next model
              console.log(`[Gemini API] Wait time of ${extractedSecs}s is high. Skipping to next model options immediately...`);
              break; 
            }
          }

          console.log(`[Gemini API] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // If we hit non-transient, or we used up our retries or wait was too long, proceed promptly to next model fallback
          break;
        }
      }
    }
  }

  // If we reach here, we've exhausted all options. Format the error feedback nicely for the user.
  const detailedMsg = lastError?.message || String(lastError);
  
  // Extract remaining wait seconds to display to user if present
  let waitSecs = 0;
  const retryMatch = detailedMsg.match(/retry in\s+([\d\.]+)\s*s/i);
  if (retryMatch && retryMatch[1]) {
    waitSecs = Math.ceil(parseFloat(retryMatch[1]));
  }

  if (detailedMsg.includes("RESOURCE_EXHAUSTED") || detailedMsg.includes("429") || detailedMsg.includes("quota exceeded") || detailedMsg.includes("Quota exceeded")) {
    const errorMsg = waitSecs > 0
      ? `Gemini API Free Tier rate limit exceeded. Please wait ${waitSecs} seconds before trying again (or configure a premium key in Settings).`
      : "Gemini API rate limit exceeded. Please wait 15-30 seconds and try again.";
    throw new Error(errorMsg);
  }

  throw new Error(`Gemini service is under heavy temporary load. Please wait a moment and try again. (Details: ${detailedMsg})`);
}

// API endpoint for blog content generation
app.post("/api/write-blog", async (req, res) => {
  try {
    const {
      primaryKeyword,
      secondaryKeywords,
      companyName,
      brandName,
      productName,
      targetAudience,
      searchIntent,
      wordCount,
      location,
      productInformation,
      cta
    } = req.body;

    if (!primaryKeyword) {
      return res.status(400).json({ error: "Primary Keyword is required" });
    }

    const wordCountNum = parseInt(wordCount) || 1000;

    // Define rules for prompt injection
    const systemInstruction = `You are an elite, experienced SEO Content Writer and Content Strategist with years of agency and corporate marketing experience.
Your goal is to write a highly valuable, informative, search-optimized blog article that naturally ranks on Google while sounding perfectly written by an expert human.

STRICT WRITING RULES:
1. Write naturally, conversationally, and with active voice.
2. YOU ARE STRICTLY FORBIDDEN from using any robotic, boilerplate, or AI-signature transitions and phrases. Do not use:
   - "In today's fast-paced world"
   - "In conclusion"
   - "Furthermore"
   - "Moreover"
   - "Delve into"
   - "Unlock the power of"
   - "In this digital age"
   - "It's important to remember"
   - "In summary"
3. Use a natural variety of sentence lengths. Combine short, punchy statements with longer, explanatory phrases.
4. Include realistic, practical examples, observations, and relevant insights to demonstrate real-world Experience, Expertise, Authoritativeness, and Trustworthiness (EEAT principles).
5. Address the reader directly as a trusted expert peer.
6. Avoid keyword stuffing. Naturally integrate the primary keyword and secondary keywords. Aim for a natural density (ideally 0.8% to 1.5% overall) without forcing them. Use semantic SEO (synonyms, related subtopics, contextual LSI terms) naturally.
7. DO NOT use emojis anywhere in the content.
8. Maintain a natural readability suitable for Grade 7-9 readers (clear, crisp structure, avoid overly pretentious flowery jargon, but don't oversimplify complex terms; explain them naturally).
9. Make the article informative first (providing genuine, high-value, practical takeaways) and promotional second (introduce the product or CTA contextually and gracefully near the middle or end, and in the designated CTA block).
10. Maintain strict accuracy and write with authority.
11. Do not mention being an AI or a language model.
12. Create exactly 5 relevant, search-intent driven Frequently Asked Questions in the FAQ section.
13. Suggest relevant image alt text ideas and internal link anchor text ideas.`;

    const promptText = `Please write a comprehensive, search-optimized blog article based on the following specific inputs.
Ensure the article satisfies a target word count of approximately ${wordCountNum} words (excluding FAQs and meta items).

INPUTS:
- Company/Brand Name: ${brandName || companyName || "N/A"}
- Product Name: ${productName || "N/A"}
- Primary Keyword: "${primaryKeyword}"
- Secondary Keywords: ${secondaryKeywords ? JSON.stringify(secondaryKeywords) : "N/A"}
- Target Audience: ${targetAudience || "General Readers"}
- Search Intent / Goal: ${searchIntent || "Informational"}
- Target Word Count: ${wordCountNum} words
- Geographic Target/Location: ${location || "Global"}
- Product Information / Context: ${productInformation || "N/A"}
- Designated CTA (Call to Action): "${cta || "Visit our website for more information."}"

FORMAT THE OUTPUT STRICTLY AS A JSON OBJECT meeting the proposed schema. Ensure you produce excellent content representing the complete article including H2/H3 main sections, and 5 FAQs.`;

    const response = await generateContentWithRetry({
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "seoTitle",
            "metaDescription",
            "urlSlug",
            "introduction",
            "tableOfContents",
            "sections",
            "conclusion",
            "faqs",
            "ctaSection",
            "internalLinkOpportunities",
            "schemaMarkupType",
            "imageAltTexts"
          ],
          properties: {
            seoTitle: {
              type: Type.STRING,
              description: "Strictly under 60 characters, must include the primary keyword naturally and be exceptionally clickable."
            },
            metaDescription: {
              type: Type.STRING,
              description: "Strictly 150-160 characters, with a compelling description and call to click."
            },
            urlSlug: {
              type: Type.STRING,
              description: "Clean, SEO-friendly, lowercased relative URL path (e.g. 'why-organic-seo-works')."
            },
            introduction: {
              type: Type.STRING,
              description: "Compelling introductory hook. Draws the target audience in immediately. Avoids generic greetings."
            },
            tableOfContents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["anchor", "title"],
                properties: {
                  anchor: { type: Type.STRING, description: "Uniquely mapped kebab-case anchor link (e.g., 'understanding-seo-goals')." },
                  title: { type: Type.STRING, description: "The corresponding heading title string." }
                }
              },
              description: "Chronological table of contents matching the main sections."
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "level", "content", "anchor"],
                properties: {
                  title: { type: Type.STRING, description: "Heading text." },
                  level: { type: Type.INTEGER, description: "Must be 2 or 3 (representing H2 or H3)." },
                  content: { type: Type.STRING, description: "The main body text of the section. Keep it richly detailed, practical, and split into multiple paragraphs where necessary. Enforce the banned words rules!" },
                  anchor: { type: Type.STRING, description: "Matches the Toc anchor." }
                }
              },
              description: "The core body of the article containing main sections with H2 and H3 structures. Ensure plenty of detailed paragraphs to meet the requested word count."
            },
            conclusion: {
              type: Type.STRING,
              description: "Natural concluding insights. NO boilerplate transitions such as 'In conclusion' or 'To sum up'. Provide high-end key takeaways."
            },
            faqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["question", "answer"],
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              },
              description: "Exactly 5 frequently asked questions matching intent and terms query parameters."
            },
            ctaSection: {
              type: Type.OBJECT,
              required: ["ctaTitle", "ctaBody"],
              properties: {
                ctaTitle: { type: Type.STRING },
                ctaBody: { type: Type.STRING, description: "Integrates the brand/company/product and the CTA naturally." }
              }
            },
            internalLinkOpportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended anchor terms and related topic contexts for internal linking."
            },
            schemaMarkupType: {
              type: Type.STRING,
              description: "Recommended Schema.org type for this article (e.g., 'BlogPosting', 'HowTo', 'TechArticle')."
            },
            imageAltTexts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Descriptive alt text suggestions targeting relevant keywords naturally for 2 to 3 suggested post headers and sections."
            }
          }
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No output received from the Gemini model");
    }

    // Parse output to ensure it is valid JSON
    const parsedData = JSON.parse(outputText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini writing error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate blog article" });
  }
});

// Endpoint to re-generate / re-write a specific section
app.post("/api/tweak-section", async (req, res) => {
  try {
    const { sectionTitle, originalContent, instructions, primaryKeyword, secondaryKeywords } = req.body;
    if (!sectionTitle || !instructions) {
      return res.status(400).json({ error: "Section title and tweak instructions are required." });
    }

    const systemInstruction = `You are an elite, experienced SEO Content Writer on behalf of a human strategist.
Your task is to rewrite or optimize a single specific section of a blog post based strictly on the user's enhancement instructions.

STRICT WRITING RULES:
1. Write naturally and conversationally using active voice.
2. DO NOT use emojis.
3. Keep sentence lengths varied.
4. STRICTLY avoid robotic AI transitions (In today's fast-paced world, In conclusion, Furthermore, Moreover, Delve into, Unlock the power of).
5. Maintain a target reading level of Grade 7-9.
6. Keep the section informative and integrate suggested terms natively.
7. Return only the revised paragraphs of text. No extra headings or conversational greetings from you.`;

    const promptText = `Please rewrite the following blog post section:
SECTION TITLE: "${sectionTitle}"
ORIGINAL CONTENT:
"${originalContent}"

TWEEKS / INSTRUCTIONS REQUESTED:
"${instructions}"

PRIMARY KEYWORD TO INTEGRATE (if applicable): "${primaryKeyword || "N/A"}"
SECONDARY KEYWORDS TO INTEGRATE (if applicable): ${secondaryKeywords ? JSON.stringify(secondaryKeywords) : "N/A"}`;

    const response = await generateContentWithRetry({
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    const tweakedContent = response.text;
    return res.json({ content: tweakedContent });
  } catch (error: any) {
    console.error("Gemini tweak error:", error);
    return res.status(500).json({ error: error.message || "Failed to tweak section" });
  }
});

// Setup Vite & Static Assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SEO Content Writer backend listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
