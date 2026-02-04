
import { GoogleGenAI, Type } from "@google/genai";
import { BrandProfile, PageType, SEOVariant, ValidationSummary, GroundingSource, AIRecommendation, StrategicImpact, ModelProvider } from "../types";

const getAiInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

interface GeminiResponse {
  pageType: PageType;
  extraction: {
    titleCurrent: string;
    metaCurrent: string;
    h1Current: string;
    headings: string[];
    mainTextPreview: string;
  };
  seoVariants: SEOVariant[];
  aiRecommendation: AIRecommendation;
  strategicImpact: StrategicImpact;
  schemaJsonld: any;
  schemaCommentary: string;
  validation: ValidationSummary;
}

function processAiData(data: any): any {
  if (typeof data.schemaJsonld === 'string') {
    try {
      data.schemaJsonld = JSON.parse(data.schemaJsonld);
    } catch (e) {
      console.warn("Failed to parse schemaJsonld string, keeping as is", e);
    }
  }
  return data;
}

async function generateWithBackend(
  input: string | { data: string; mimeType: string },
  profile: BrandProfile,
  isUrl: boolean,
  modelProvider: ModelProvider
): Promise<GeminiResponse & { groundingSources: GroundingSource[] }> {
  const response = await fetch('http://localhost:3001/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input,
      profile,
      isUrl,
      modelProvider
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Backend generation failed');
  }

  const result = await response.json();
  let data = result.data ? JSON.parse(result.data) : result;
  data = processAiData(data);

  return {
    ...data,
    groundingSources: result.groundingSources || []
  };
}

export const generateContent = async (
  input: string | { data: string; mimeType: string },
  profile: BrandProfile,
  pageTypeOverride?: PageType,
  isUrl: boolean = false,
  modelProvider: ModelProvider = ModelProvider.GEMINI
): Promise<GeminiResponse & { groundingSources: GroundingSource[] }> => {
  // Always use backend for security (protects API keys)
  if (modelProvider === ModelProvider.OPENAI) {
    return await generateWithBackend(input, profile, isUrl, modelProvider);
  }

  // For Gemini, continue with direct API call but update model name
  const modelName = isUrl ? 'gemini-1.5-pro' : 'gemini-2.0-flash-exp';
  const ai = getAiInstance();

  const brandContext = `
    BRAND CONTEXT: ${profile.legalName} (${profile.name})
    - Website: https://${profile.domain}/
    - Logo: ${profile.logoUrl}
    - Org Type: ${profile.orgType}
  `;

  const systemInstruction = `
    You are an elite Enterprise SEO Architect. Your goal is to analyze the provided content and optimize it for Google's "Helpful Content" era and LLM search agents.

    ${brandContext}

    ### CORE MISSIONS:
    1. **De-noise**: Extract only the core semantic body. Ignore navigation, headers, footers, and sidebars.
    2. **Strategic Audit**: Provide 3 distinct SEO Growth Strategies.
    3. **Analytics**: Calculate 0-100 scores for Visibility, Trust, and Compliance.
    4. **Mandatory Schema Architecture**: You MUST generate a comprehensive @graph JSON-LD structure. 
       EVERY output must include:
       - **Organization** & **WebSite**: Brand identity.
       - **WebPage** & **BreadcrumbList**: Navigation path.
       - **FAQPage**: Generate at least 3 relevant questions/answers based on the content.
       - **HowTo**: If the content contains steps or processes, structure them here; otherwise, structure a "How to Apply/Engage" process based on brand knowledge.
       - **FinancialProduct/Product**: Specific details based on content.

    ### CRITICAL CONSTRAINTS:
    - NO mentions of "AI", "Gemini", or "LLM" in the output text.
    - Terminology: For Emirates Islamic, strictly use "Profit Rate" instead of "Interest".
    - Use "Strategic Impact" instead of "AI Recommendations".
  `;

  let parts: any[] = [];
  if (isUrl && typeof input === 'string') {
    parts.push({ text: `Perform an Enterprise Growth Audit for this URL: ${input}` });
  } else if (typeof input === 'object') {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
    parts.push({ text: `Deep-dive analysis of the attached document. Extract core message and technical SEO requirements.` });
  } else {
    parts.push({ text: `Semantic analysis of provided content: ${input.substring(0, 20000)}` });
  }

  const config: any = {
    systemInstruction,
    temperature: 0.1,
    responseMimeType: "application/json",
    thinkingConfig: { thinkingBudget: modelName.includes('pro') ? 16000 : 8000 },
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        pageType: { type: Type.STRING },
        extraction: {
          type: Type.OBJECT,
          properties: {
            titleCurrent: { type: Type.STRING },
            metaCurrent: { type: Type.STRING },
            h1Current: { type: Type.STRING },
            headings: { type: Type.ARRAY, items: { type: Type.STRING } },
            mainTextPreview: { type: Type.STRING }
          },
          required: ["titleCurrent", "metaCurrent", "h1Current", "headings", "mainTextPreview"]
        },
        seoVariants: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              h1: { type: Type.STRING },
              metaTitle: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              keyphrases: { type: Type.ARRAY, items: { type: Type.STRING } },
              rationale: { type: Type.STRING },
              bestFor: { type: Type.STRING },
              justification: { type: Type.STRING },
              situationalComparison: { type: Type.STRING }
            },
            required: ["h1", "metaTitle", "metaDescription", "keyphrases", "bestFor", "situationalComparison"]
          }
        },
        aiRecommendation: {
          type: Type.OBJECT,
          properties: {
            winnerIndex: { type: Type.NUMBER },
            expertRationale: { type: Type.STRING },
            comparisonNotes: { type: Type.STRING }
          },
          required: ["winnerIndex", "expertRationale"]
        },
        strategicImpact: {
          type: Type.OBJECT,
          properties: {
            visibilityScore: { type: Type.NUMBER },
            trustScore: { type: Type.NUMBER },
            complianceScore: { type: Type.NUMBER },
            growthRationale: { type: Type.STRING },
            entityLinkage: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["visibilityScore", "trustScore", "complianceScore", "growthRationale", "entityLinkage"]
        },
        schemaJsonld: { type: Type.STRING },
        schemaCommentary: { type: Type.STRING },
        validation: {
          type: Type.OBJECT,
          properties: {
            errors: { type: Type.ARRAY, items: { type: Type.STRING } },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["errors", "warnings", "suggestions"]
        }
      },
      required: ["pageType", "extraction", "seoVariants", "aiRecommendation", "strategicImpact", "schemaJsonld", "schemaCommentary", "validation"]
    }
  };

  if (isUrl) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Analysis engine returned empty result.");

    let data = JSON.parse(resultText);
    data = processAiData(data);
    
    const groundingSources: GroundingSource[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          groundingSources.push({
            title: chunk.web.title || 'Source Reference',
            uri: chunk.web.uri
          });
        }
      });
    }

    return { ...data, groundingSources };
  } catch (error: any) {
    console.error("Analysis Engine Error:", error);
    throw error;
  }
};
