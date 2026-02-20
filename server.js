
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Banking Schema Specification for ENBD & Emirates Islamic
const BANKING_SCHEMA_INSTRUCTION = `
## BANKING SCHEMA ARCHITECTURE (ENBD & Emirates Islamic)

You MUST generate schema following this exact specification:

### 1. CHANNEL DETECTION
- **ENBD**: emiratesnbd.com
- **Emirates Islamic (EI)**: emiratesislamic.ae

### 2. MANDATORY NODES (All Pages)
Always include these 4 base nodes:
- Organization (from channel preset)
- WebSite (from channel preset)
- WebPage (populated from content)
- BreadcrumbList (from URL structure)

### 3. PAGE TYPE & CONDITIONAL NODES

**ProductPage** (if content mentions: credit card, account, loan, finance, mortgage, deposit):
- FinancialProduct + Product (dual type: ["FinancialProduct", "Product"])
- FAQPage (if Q&A content exists)
- HowTo – Apply (always for products)
- HowTo – Usage/Rewards (only if rewards/miles/cashback mentioned)
- ItemList (only if related products mentioned)
- SpecialAnnouncement (only if active offer/promotion)

**CampaignPage** (if content mentions: offer, limited time, promotion):
- SpecialAnnouncement
- FAQPage (if Q&A exists)
- HowTo – Apply/Participate

**PressRelease** (if content mentions: announces, launched, partnership, award):
- NewsArticle

**BlogArticle** (if content mentions: guide, tips, how to, explained):
- Article
- FAQPage (if Q&A exists)
- HowTo (if instructional)

### 4. ISLAMIC FINANCE TERMINOLOGY (EI Channel Only)
For Emirates Islamic pages, you MUST:
- Use "Profit Rate" instead of "Interest Rate"
- Add Islamic finance aliases to alternateName:
  * Credit Card → add "Islamic credit card UAE", "Sharia compliant credit card", "Murabaha credit card", "halal credit card UAE"
  * Home Finance → add "Ijara home finance", "Murabaha mortgage", "Islamic mortgage UAE"
  * Personal Finance → add "Murabaha personal finance", "Islamic personal loan"
  * Savings → add "Mudaraba savings account", "Islamic savings UAE"
  * Business Finance → add "Musharaka business finance", "Islamic SME loan"

### 5. @ID ANCHOR PATTERNS
Use these exact patterns:
- Organization: https://www.emiratesnbd.com/#organization (with trailing slash before #)
- WebSite: https://www.emiratesnbd.com/#website (with trailing slash before #)
- WebPage: [PAGE_URL]#webpage (NO trailing slash before #)
- FinancialProduct: [PAGE_URL]#card
- FAQPage: [PAGE_URL]#faq
- HowTo Apply: [PAGE_URL]#howto-apply
- HowTo Usage: [PAGE_URL]#howto-usage
- BreadcrumbList: [PAGE_URL]#breadcrumb
- SpecialAnnouncement: [PAGE_URL]#offer-announcement

### 6. CRITICAL RULES
- NO AggregateRating, Review, or VideoObject for banking products
- NO HTML in FAQPage acceptedAnswer.text (plain text only)
- Every node MUST have an @id
- All @id cross-references must be consistent
- AlternateName MUST include both generic and Islamic finance terms (for EI)
- FinancialProduct MUST use dual type: ["FinancialProduct", "Product"]

### 7. BREADCRUMB LOGIC
Infer from URL path segments. Example:
URL: /en/personal-banking/cards/credit-cards/skywards-infinite
Breadcrumb: Home > Personal Banking > Cards > Credit Cards > Skywards Infinite

Generate BreadcrumbList with proper position and item structure.

### 8. FAQ GENERATION
If content has Q&A section, extract it.
If not, generate minimum 3 relevant FAQs like:
- "What is the [Product Name]?"
- "What are the fees for [Product Name]?"
- "How do I apply for [Product Name]?"
- "Is [Product Name] Sharia compliant?" (for EI only)

Plain text answers only - no HTML tags allowed.

### 9. HOWTO STRUCTURE
**HowTo – Apply** (always for products):
Step 1: Check Eligibility
Step 2: Prepare Documents (Emirates ID, passport, bank statements, salary certificate)
Step 3: Submit Online Application
Step 4: Upload Documents
Step 5: Await Approval (3-5 business days)
Step 6: Activate Card/Account

**HowTo – Usage/Rewards** (only if rewards/miles exist):
Step 1: Spend on Your Card (mention earn rate)
Step 2: Track Your Miles/Points
Step 3: Redeem for Flights/Rewards
Step 4: Claim Welcome Bonus (if applicable)

### 10. ORGANIZATION PRESETS

**ENBD Organization**:
{
  "@type": "Organization",
  "@id": "https://www.emiratesnbd.com/#organization",
  "name": "Emirates NBD",
  "alternateName": ["ENBD", "Emirates NBD Bank", "Emirates National Bank of Dubai", "Emirates NBD PJSC"],
  "url": "https://www.emiratesnbd.com",
  "logo": {"@type": "ImageObject", "url": "https://www.emiratesnbd.com/assets/en/images/logo.svg", "width": 200, "height": 60},
  "description": "Emirates NBD is one of the leading banking groups in the Middle East and North Africa, headquartered in Dubai, UAE.",
  "foundingDate": "2007",
  "areaServed": {"@type": "Country", "name": "United Arab Emirates"},
  "sameAs": ["https://en.wikipedia.org/wiki/Emirates_NBD", "https://www.linkedin.com/company/emirates-nbd", "https://twitter.com/emiratesnbd"]
}

**Emirates Islamic Organization**:
{
  "@type": "Organization",
  "@id": "https://www.emiratesislamic.ae/#organization",
  "name": "Emirates Islamic",
  "alternateName": ["EI", "Emirates Islamic Bank", "Emirates Islamic PJSC", "Emirates Islamic – Sharia Compliant Banking"],
  "url": "https://www.emiratesislamic.ae",
  "logo": {"@type": "ImageObject", "url": "https://www.emiratesislamic.ae/-/media/ei/images/header/emirates-islamic-logo.svg", "width": 200, "height": 60},
  "description": "Emirates Islamic is a leading Islamic bank in the UAE, offering Sharia-compliant retail and corporate banking products.",
  "foundingDate": "2004",
  "areaServed": {"@type": "Country", "name": "United Arab Emirates"},
  "sameAs": ["https://en.wikipedia.org/wiki/Emirates_Islamic_Bank", "https://www.linkedin.com/company/emirates-islamic", "https://twitter.com/emiratesislamic"]
}

Return the schema as a complete @graph JSON object with all required nodes.
`;

const app = express();
const PORT = process.env.PORT || 3007;

// 1. Security Headers
app.use(helmet());

// 2. CORS - Allow production domain and localhost for development
const allowedOrigins = [
  'https://seo.xopenai.in',
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000'  // Alternative dev port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['POST', 'GET', 'OPTIONS'],
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
        You are an elite Enterprise SEO Architect specializing in banking and financial services. Your goal is to analyze the provided content and optimize it for Google's "Helpful Content" era, LLM search agents, and Rich Snippets.

        ${brandContext}

        ### CORE MISSIONS:
        1. **De-noise**: Extract only the core semantic body. Ignore navigation, headers, footers, and sidebars.
        2. **Strategic Audit**: Provide EXACTLY 3 distinct SEO Growth Strategies (variants) optimized for banking products.
        3. **Analytics**: Calculate 0-100 scores for Visibility, Trust, and Compliance.
        4. **World-Class Banking Schema**: Generate comprehensive, specification-compliant schema.org markup.

        ${BANKING_SCHEMA_INSTRUCTION}

        ### CRITICAL CONSTRAINTS:
        - NO mentions of "AI", "Gemini", or "LLM" in user-facing output text.
        - For Emirates Islamic (emiratesislamic.ae): ALWAYS use "Profit Rate" instead of "Interest Rate"
        - For Emirates Islamic: Include Islamic finance terminology in alternateName (Murabaha, Ijara, etc.)
        - Use "Strategic Impact" instead of "AI Recommendations"
        - Schema must be a complete @graph JSON object, not a string
        - All @id references must be cross-reference consistent
        - FAQPage answers must be plain text only (no HTML tags)

        Return a valid JSON object with the following structure:
        - IMPORTANT: seoVariants array must contain EXACTLY 3 objects
        - IMPORTANT: schemaJsonld must be a complete JSON object (not a string) with @context and @graph array
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
          "schemaJsonld": {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "...",
                "..."
              }
            ]
          },
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

CRITICAL: When users ask you to create, modify, or enhance SEO variants or schema, you MUST:
1. Provide a clear explanation of what you're changing and why
2. Generate the complete new variant or schema wrapped in the EXACT markers shown below
3. ALWAYS include the markers - they are required for the system to detect your output

For NEW SEO VARIANTS, you MUST use this EXACT format (include the markers):
---NEW_VARIANT---
{
  "h1": "Your improved H1 here",
  "metaTitle": "Your improved meta title here",
  "metaDescription": "Your improved meta description here",
  "keyphrases": ["keyword1", "keyword2", "keyword3"],
  "rationale": "Why this variant works",
  "bestFor": "Target audience/use case",
  "justification": "Technical justification",
  "situationalComparison": "How it compares to others"
}
---END_VARIANT---

For SCHEMA MODIFICATIONS or ENHANCEMENTS, you MUST use this EXACT format (include the markers):
---NEW_SCHEMA---
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "...": "..."
    }
  ]
}
---END_SCHEMA---

IMPORTANT RULES:
- ALWAYS wrap JSON output in the markers (---NEW_VARIANT--- or ---NEW_SCHEMA---)
- Do NOT use markdown code blocks (no \`\`\`json)
- The markers MUST be on their own lines
- Without the markers, the user won't see the "Add to Dashboard" button
- If user asks for schema enhancement, ALWAYS include ---NEW_SCHEMA--- markers`;

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

    // Try to extract with markers first (preferred method)
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

    // Fallback: Try to detect JSON blocks if markers weren't used
    if (!newSchema && !newVariant) {
      // Look for JSON code blocks with ```json
      const jsonBlockMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        try {
          const parsed = JSON.parse(jsonBlockMatch[1].trim());
          // Check if it's a schema (has @context or @graph)
          if (parsed['@context'] || parsed['@graph']) {
            newSchema = parsed;
            console.log('Extracted schema from markdown code block');
          }
          // Check if it's a variant (has metaTitle and metaDescription)
          else if (parsed.metaTitle && parsed.metaDescription) {
            newVariant = parsed;
            console.log('Extracted variant from markdown code block');
          }
        } catch (e) {
          console.warn('Failed to parse JSON code block', e);
        }
      }

      // Also try plain JSON objects wrapped in curly braces
      if (!newSchema && !newVariant) {
        const jsonMatch = assistantMessage.match(/\{[\s\S]*"@context"[\s\S]*"@graph"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            newSchema = JSON.parse(jsonMatch[0]);
            console.log('Extracted schema from plain JSON');
          } catch (e) {
            console.warn('Failed to parse plain JSON schema', e);
          }
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
