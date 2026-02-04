
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers
app.use(helmet());

// 2. CORS - Restrict this to your DigitalOcean domain in production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', 
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

// 3. Rate Limiting - Protect your wallet/quota
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: { error: 'Too many audits from this IP, please try again later.' }
});
app.use('/api/', limiter);

// 4. AI SDK Initialization (Server Side)
const getGeminiInstance = () => {
  if (!process.env.API_KEY) {
    throw new Error("SERVER_CONFIG_ERROR: GEMINI API_KEY is missing on the server.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getOpenAIInstance = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("SERVER_CONFIG_ERROR: OPENAI_API_KEY is missing on the server.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// 5. Proxy Endpoint - Supports both Gemini and OpenAI
app.post('/api/generate', async (req, res) => {
  try {
    const { input, profile, isUrl, modelProvider } = req.body;

    if (!input || !profile) {
      return res.status(400).json({ error: 'Invalid request payload: input and profile required' });
    }

    const provider = modelProvider || 'gemini';

    if (provider === 'openai') {
      // OpenAI Handler
      const openai = getOpenAIInstance();

      const brandContext = `
        BRAND CONTEXT: ${profile.legalName} (${profile.name})
        - Website: https://${profile.domain}/
        - Logo: ${profile.logoUrl}
        - Org Type: ${profile.orgType}
      `;

      const systemPrompt = `
        You are an elite Enterprise SEO Architect. Your goal is to analyze the provided content and optimize it for Google's "Helpful Content" era and LLM search agents.

        ${brandContext}

        ### CORE MISSIONS:
        1. **De-noise**: Extract only the core semantic body. Ignore navigation, headers, footers, and sidebars.
        2. **Strategic Audit**: Provide EXACTLY 3 distinct SEO Growth Strategies (variants).
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

        Return a valid JSON object with the following structure (IMPORTANT: seoVariants array must contain EXACTLY 3 objects):
        {
          "pageType": "product|campaign|offer|press_release|generic",
          "extraction": {
            "titleCurrent": "string",
            "metaCurrent": "string",
            "h1Current": "string",
            "headings": ["string"],
            "mainTextPreview": "string"
          },
          "seoVariants": [
            {
              "h1": "string",
              "metaTitle": "string",
              "metaDescription": "string",
              "keyphrases": ["string"],
              "rationale": "string",
              "bestFor": "string",
              "justification": "string",
              "situationalComparison": "string"
            },
            {
              "h1": "string",
              "metaTitle": "string",
              "metaDescription": "string",
              "keyphrases": ["string"],
              "rationale": "string",
              "bestFor": "string",
              "justification": "string",
              "situationalComparison": "string"
            },
            {
              "h1": "string",
              "metaTitle": "string",
              "metaDescription": "string",
              "keyphrases": ["string"],
              "rationale": "string",
              "bestFor": "string",
              "justification": "string",
              "situationalComparison": "string"
            }
          ],
          "aiRecommendation": {
            "winnerIndex": 0,
            "expertRationale": "string",
            "comparisonNotes": "string"
          },
          "strategicImpact": {
            "visibilityScore": 0-100,
            "trustScore": 0-100,
            "complianceScore": 0-100,
            "growthRationale": "string",
            "entityLinkage": ["string"]
          },
          "schemaJsonld": "JSON-LD string",
          "schemaCommentary": "string",
          "validation": {
            "errors": ["string"],
            "warnings": ["string"],
            "suggestions": ["string"]
          }
        }
      `;

      let userContent = '';
      if (isUrl && typeof input === 'string') {
        userContent = `Perform an Enterprise Growth Audit for this URL: ${input}`;
      } else if (typeof input === 'object' && input.data) {
        userContent = `Deep-dive analysis of the attached document. Extract core message and technical SEO requirements.`;
      } else {
        userContent = `Semantic analysis of provided content: ${typeof input === 'string' ? input.substring(0, 20000) : JSON.stringify(input)}`;
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });

      const resultText = completion.choices[0].message.content;
      let data = JSON.parse(resultText);

      // Process schemaJsonld if it's a string
      if (typeof data.schemaJsonld === 'string') {
        try {
          data.schemaJsonld = JSON.parse(data.schemaJsonld);
        } catch (e) {
          console.warn("Failed to parse schemaJsonld string, keeping as is", e);
        }
      }

      res.json({
        data: JSON.stringify(data),
        groundingSources: []
      });

    } else {
      // Gemini Handler (existing logic)
      const { contents, config, systemInstruction } = req.body;

      if (!contents || !systemInstruction) {
        return res.status(400).json({ error: 'Invalid Gemini request payload' });
      }

      const ai = getGeminiInstance();

      const response = await ai.models.generateContent({
        model: config.model || 'gemini-2.5-flash',
        contents: contents,
        config: {
          ...config,
          systemInstruction: systemInstruction,
          responseMimeType: "application/json"
        }
      });

      res.json({
        text: response.text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      });
    }

  } catch (error) {
    console.error('AI Proxy Error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || 'Internal Server Error',
      code: status
    });
  }
});

// 6. Chat Endpoint - OpenAI powered chatbot for SEO assistance
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    const openai = getOpenAIInstance();

    // Build system context with SEO generation data
    let systemContext = `You are an expert SEO Assistant helping users understand and optimize their SEO strategies. You provide clear, actionable advice about SEO variants, schema markup, and content optimization.

When users ask you to create, modify, or enhance SEO variants or schema, you should:
1. Provide a clear explanation of the changes
2. Generate the complete new variant or schema in a structured format

For NEW SEO VARIANTS, always structure them as:
---NEW_VARIANT---
{
  "h1": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "keyphrases": ["..."],
  "rationale": "...",
  "bestFor": "...",
  "justification": "...",
  "situationalComparison": "..."
}
---END_VARIANT---

For SCHEMA MODIFICATIONS, structure them as:
---NEW_SCHEMA---
{
  "@context": "https://schema.org",
  "@graph": [...]
}
---END_SCHEMA---`;

    if (context) {
      systemContext += `\n\nCurrent SEO Generation Context:\n`;
      systemContext += `- URL: ${context.url}\n`;
      systemContext += `- Page Type: ${context.pageType}\n`;
      systemContext += `- Model Used: ${context.modelProvider}\n`;

      if (context.seoVariants && context.seoVariants.length > 0) {
        systemContext += `\nSEO Variants:\n`;
        context.seoVariants.forEach((variant, idx) => {
          systemContext += `\nVariant ${idx + 1}:\n`;
          systemContext += `- H1: ${variant.h1}\n`;
          systemContext += `- Meta Title: ${variant.metaTitle}\n`;
          systemContext += `- Meta Description: ${variant.metaDescription}\n`;
          systemContext += `- Best For: ${variant.bestFor}\n`;
          systemContext += `- Keyphrases: ${variant.keyphrases?.join(', ')}\n`;
        });
      }

      if (context.aiRecommendation) {
        systemContext += `\nRecommended Variant: Variant ${context.aiRecommendation.winnerIndex + 1}\n`;
        systemContext += `Rationale: ${context.aiRecommendation.expertRationale}\n`;
      }

      if (context.strategicImpact) {
        systemContext += `\nStrategic Impact Scores:\n`;
        systemContext += `- Visibility: ${context.strategicImpact.visibilityScore}/100\n`;
        systemContext += `- Trust: ${context.strategicImpact.trustScore}/100\n`;
        systemContext += `- Compliance: ${context.strategicImpact.complianceScore}/100\n`;
      }

      if (context.schemaJsonld) {
        systemContext += `\nCurrent Schema:\n${JSON.stringify(context.schemaJsonld, null, 2)}\n`;
      }
    }

    const chatMessages = [
      { role: 'system', content: systemContext },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1500
    });

    const assistantMessage = completion.choices[0].message.content;

    // Detect if the response contains a new variant or schema
    let newVariant = null;
    let newSchema = null;

    if (assistantMessage.includes('---NEW_VARIANT---')) {
      const variantMatch = assistantMessage.match(/---NEW_VARIANT---([\s\S]*?)---END_VARIANT---/);
      if (variantMatch) {
        try {
          newVariant = JSON.parse(variantMatch[1].trim());
        } catch (e) {
          console.warn('Failed to parse new variant', e);
        }
      }
    }

    if (assistantMessage.includes('---NEW_SCHEMA---')) {
      const schemaMatch = assistantMessage.match(/---NEW_SCHEMA---([\s\S]*?)---END_SCHEMA---/);
      if (schemaMatch) {
        try {
          newSchema = JSON.parse(schemaMatch[1].trim());
        } catch (e) {
          console.warn('Failed to parse new schema', e);
        }
      }
    }

    res.json({
      message: assistantMessage,
      newVariant: newVariant,
      newSchema: newSchema
    });

  } catch (error) {
    console.error('Chat Error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || 'Chat service error',
      code: status
    });
  }
});

app.listen(PORT, () => {
  console.log(`SECURE BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`GEMINI API KEY: ${process.env.API_KEY ? 'ACTIVE' : 'MISSING'}`);
  console.log(`OPENAI API KEY: ${process.env.OPENAI_API_KEY ? 'ACTIVE' : 'MISSING'}`);
});
