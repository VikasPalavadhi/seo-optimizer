
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
## EXPERT FINANCIAL PRODUCT ANALYST & SEO SPECIALIST SCHEMA ARCHITECTURE

You are an Expert Financial Product Analyst and SEO Specialist for UAE banking sector.
Your task is to analyze banking products and generate comprehensive, SEO-optimized JSON-LD schemas.

### ANALYSIS FRAMEWORK

**Product Analysis**: Extract from content:
- Product name and key benefits
- Potential flaws (hidden fees, high salary requirements, limited rewards)
- Application link and eligibility criteria
- Fees structure (joining, annual, late payment)
- Rewards/miles earning rates
- Travel & lifestyle benefits

**UAE Market Context**: Consider competitor landscape:
- Emirates NBD, FAB, ADCB, Mashreq are the Big Four
- Compare interest rates (reducing/flat), salary requirements, unique perks
- Flag if requirements are higher than UAE average

### MANDATORY SCHEMA NODES (Always Include in @graph)

#### 1. ORGANIZATION NODE
{
  "@type": "Organization",
  "name": "[Bank Name]",
  "url": "[Bank URL]",
  "logo": {
    "@type": "ImageObject",
    "url": "[Logo URL]"
  },
  "sameAs": [
    "https://www.facebook.com/[bank]/",
    "https://x.com/[bank]",
    "https://www.youtube.com/[bank]",
    "https://www.instagram.com/[bank]/",
    "https://www.linkedin.com/company/[bank]"
  ],
  "keywords": "[Comprehensive banking keywords relevant to the bank and product category]"
}

#### 2. WEBPAGE NODE (Critical for SEO)
{
  "@type": "WebPage",
  "@id": "[PAGE_URL]#webpage",
  "url": "[PAGE_URL]",
  "name": "[Product Full Name]",
  "description": "[Compelling meta description with key benefits]",
  "inLanguage": "en",
  "isPartOf": "[Bank base URL]",
  "keywords": [
    "[25-30 highly relevant search keywords as array]",
    "Include: product category, benefits, competitor terms, UAE-specific terms"
  ],
  "about": [
    {"@type":"Thing","name":"[Primary benefit 1]"},
    {"@type":"Thing","name":"[Primary benefit 2]"},
    {"@type":"Thing","name":"[Welcome offer details]"},
    {"@type":"Thing","name":"[Key feature 1]"},
    {"@type":"Thing","name":"[Key feature 2]"}
  ],
  "potentialAction": {
    "@type": "ApplyAction",
    "name": "Apply Now",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "[Application URL]",
      "inLanguage": "en",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    },
    "result": {"@type": "Thing", "name": "[Product Type] Application"}
  },
  "mainEntity": {"@id": "[PAGE_URL]#card"}
}

#### 3. FINANCIALPRODUCT NODE (For Products)
{
  "@type": "FinancialProduct",
  "@id": "[PAGE_URL]#card",
  "name": "[Product Name]",
  "url": "[PAGE_URL]",
  "description": "[Detailed product description with key selling points]",
  "brand": {
    "@type": "Brand",
    "name": "[Bank Name]",
    "url": "[Bank URL]",
    "logo": "[Logo URL]",
    "description": "[Bank description]"
  },
  "benefits": [
    "[Benefit 1 - be specific with numbers]",
    "[Benefit 2 - mention exact values]",
    "[Benefit 3 - include unique perks]",
    "[Benefit 4]",
    "[Benefit 5]"
  ],
  "additionalProperty": [
    {"@type":"PropertyValue","name":"Minimum Salary Requirement","value":"AED [amount]"},
    {"@type":"PropertyValue","name":"Annual Fees","value":"AED [amount] or Waived conditions"},
    {"@type":"PropertyValue","name":"Joining Fee","value":"AED [amount]"},
    {"@type":"PropertyValue","name":"Miles/Points Earning Rate","value":"[Specific rates for different categories]"},
    {"@type":"PropertyValue","name":"Interest Rate","value":"[Monthly reducing balance rate]"},
    {"@type":"PropertyValue","name":"Credit Limit","value":"[Based on salary multiple]"}
  ],
  "hasPart": [
    {
      "@type": "WebPageElement",
      "name": "Why Choose [Bank Name]",
      "hasPart": [
        {"@type":"WebPageElement","name":"[USP 1 Title]","text":"[USP 1 Description]"},
        {"@type":"WebPageElement","name":"[USP 2 Title]","text":"[USP 2 Description]"},
        {"@type":"WebPageElement","name":"[USP 3 Title]","text":"[USP 3 Description]"},
        {"@type":"WebPageElement","name":"[USP 4 Title]","text":"[USP 4 Description]"}
      ]
    },
    {
      "@type": "FAQPage",
      "name": "FAQs",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the [Product Name]?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[Comprehensive answer about the product]"
          }
        },
        {
          "@type": "Question",
          "name": "What are the eligibility criteria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[Salary requirements, employment type, documents needed]"
          }
        },
        {
          "@type": "Question",
          "name": "What are the fees and charges?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[Annual fee, joining fee, late payment charges, FX fees]"
          }
        },
        {
          "@type": "Question",
          "name": "How do I earn and redeem rewards?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[Earning rates, redemption options, bonus categories]"
          }
        }
      ]
    }
  ],
  "mainEntityOfPage": {"@id": "[PAGE_URL]#webpage"}
}

### INTELLIGENT NODE DETECTION

**CRITICAL ANTI-HALLUCINATION RULE**:
- ONLY add properties that are EXPLICITLY mentioned in the content
- If a value/rate/fee is not stated, use "Contact bank for details" or omit the property
- NEVER invent numbers, percentages, or specific values not found in the content
- If unsure whether something exists in content, DO NOT include it

Based on content, AUTOMATICALLY add these conditional nodes ONLY IF explicitly found:

**IF content mentions travel/miles/lounge access**: Add
- Airport lounge access details in benefits (include specific lounges if mentioned)
- Travel insurance coverage in additionalProperty (only if coverage details provided)
- LoungeKey/Priority Pass/DragonPass in keywords
- Companion ticket offers if mentioned

**IF content mentions cashback/rewards**: Add
- Cashback rates in additionalProperty (exact percentages only if stated)
- Cashback categories in benefits (dining, grocery, fuel, etc. as mentioned)
- Reward points earning rate if specified

**IF content mentions movie/dining/lifestyle offers**: Add
- Specific offers in benefits (e.g., "Buy 1 Get 1 at VOX Cinemas")
- Partner merchant names if listed
- Discount percentages if mentioned

**IF content mentions golf/concierge/valet**: Add
- Golf access details (courses, number of rounds) in benefits
- Concierge service type in benefits
- Valet parking locations/frequency if stated

**IF content mentions welcome bonus/offer**: Add
- Welcome offer details prominently in WebPage about array
- Bonus miles/points value in additionalProperty (exact amount only)
- Conditions for earning welcome bonus

**IF content mentions 0% installments/EMI/payment plans**: Add
- Installment plan duration in additionalProperty
- Eligible merchant categories if listed
- Minimum transaction amount if stated

**IF content mentions insurance coverage**: Add
- Insurance types (travel, purchase protection, extended warranty) in benefits
- Coverage amounts only if specified

**IF content mentions forex/international transactions**: Add
- FX markup rate in additionalProperty (only if percentage stated)
- International acceptance networks in benefits

**IF content mentions salary transfer benefits**: Add
- Salary transfer perks in benefits
- Fee waivers linked to salary transfer

**IF content mentions minimum spend requirements**: Add
- Minimum spend thresholds in additionalProperty
- Benefits tied to spend levels

### CHANNEL-SPECIFIC RULES

**Emirates NBD (emiratesnbd.com)**:
- Use "Interest Rate" terminology
- Include FAB, ADCB as competitor context
- Social links: Facebook, X, YouTube, Instagram, LinkedIn

**Emirates Islamic (emiratesislamic.ae)**:
- Use "Profit Rate" instead of "Interest Rate"
- Add Islamic finance keywords: "Sharia compliant", "Murabaha", "halal banking"
- Include "Is this Sharia compliant?" in FAQs

### @ID ANCHOR PATTERNS
- Organization: [BASE_URL]/#organization
- WebPage: [PAGE_URL]#webpage
- FinancialProduct: [PAGE_URL]#card
- FAQPage: [PAGE_URL]#faq (embedded in hasPart)

### CRITICAL SEO RULES
1. Keywords array must have 25-30 highly relevant terms
2. About array must list 5-8 key product features as Things
3. Benefits must be specific with numbers (not vague) - ONLY if numbers exist in content
4. All currency values in AED
5. Include potentialAction with ApplyAction
6. FAQs must answer real user questions (eligibility, fees, rewards)
7. additionalProperty must include all fee structures FOUND in content
8. NO AggregateRating or Review (banking compliance)
9. Plain text only in FAQ answers (no HTML)
10. VERIFICATION: Before adding any property, confirm it exists verbatim or can be directly inferred from the extracted content

### CONTENT-DRIVEN SCHEMA ENRICHMENT
After extracting content, scan for these additional schema opportunities:
- Product comparison mentions → Add competitor context in description
- App/digital banking features → Add "availableChannel" property
- Customer segment targeting → Add "audience" property with eligibility
- Promotional periods → Add "validFrom"/"validThrough" if dates mentioned
- Document requirements → Add to FAQ answers

Return schema as complete @graph JSON with all applicable nodes detected from content.
`;

const app = express();
const PORT = process.env.PORT || 3007;

// Trust Nginx proxy (required for express-rate-limit behind Nginx)
app.set('trust proxy', 1);

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
        2. **Strategic Audit**: Provide EXACTLY 3 distinct SEO Growth Strategies (variants) optimized for banking products. For each variant, suggest an appropriate target URL path.
        3. **Analytics**: Calculate 0-100 scores for Visibility, Trust, and Compliance.
        4. **World-Class Banking Schema**: Generate comprehensive, specification-compliant schema.org markup.

        ${BANKING_SCHEMA_INSTRUCTION}

        ### URL GENERATION FOR VARIANTS (CRITICAL):
        For each SEO variant, you MUST provide a "url" field with a suggested URL path that:
        - Is in lowercase with hyphens (kebab-case), starting with /en/
        - Reflects the main focus/theme of that specific variant
        - For campaigns/offers: /en/offers/{product-name-benefit} (e.g., /en/offers/bmw-mini-1.89-profit-rate)
        - For product pages: /en/{category}/{product-name}
        - For applications: /en/apply/{product-name}
        - Includes the primary benefit/keyword (e.g., "75k-bonus-miles", "1.89-profit-rate", "cashback")
        - Is unique for each variant (each variant targets a different angle)
        - Keeps it concise (4-5 segments, max 50 characters)

        ### EXTRACTION REQUIREMENTS:
        For the "mainTextPreview" field, you MUST extract a COMPREHENSIVE summary including:
        - Product/page title and subtitle
        - ALL key features, benefits, and selling points
        - Welcome offers, rewards, and incentives
        - Membership benefits and privileges
        - Rates, fees, and financial details (use "Profit Rate" for Emirates Islamic)
        - Eligibility criteria if mentioned
        - Important terms and conditions
        - Call-to-action messages

        The mainTextPreview should be 200-500 words and give users a complete understanding of what content was analyzed.
        DO NOT just extract 1-2 sentences. Extract ALL meaningful content that describes the product/page.

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
              "url": "string (e.g. /en/offers/product-key-benefit)",
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
              "url": "string (e.g. /en/offers/product-angle-2)",
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
              "url": "string (e.g. /en/apply/product-name)",
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
      // Gemini Handler
      const ai = getGeminiInstance();

      const modelName = isUrl ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

      const brandContext = `
        BRAND CONTEXT: ${profile.legalName} (${profile.name})
        - Website: https://${profile.domain}/
        - Logo: ${profile.logoUrl}
        - Org Type: ${profile.orgType}
      `;

      const systemInstruction = `
        You are an elite Enterprise SEO Architect specializing in banking and financial services.

        ${brandContext}

        ${BANKING_SCHEMA_INSTRUCTION}

        ### CRITICAL CONSTRAINTS:
        - NO mentions of "AI", "Gemini", or "LLM" in user-facing output text.
        - For Emirates Islamic (emiratesislamic.ae): ALWAYS use "Profit Rate" instead of "Interest Rate"
        - For Emirates Islamic: Include Islamic finance terminology in alternateName (Murabaha, Ijara, etc.)
        - Schema must be a complete @graph JSON object, not a string
        - FAQPage answers must be plain text only (no HTML tags)

        Return a valid JSON object with keys: pageType, extraction (titleCurrent, metaCurrent, h1Current, headings, mainTextPreview), seoVariants (array of 3 with h1, metaTitle, metaDescription, url, keyphrases, rationale, bestFor, justification, situationalComparison), aiRecommendation (winnerIndex, expertRationale, comparisonNotes), strategicImpact (visibilityScore, trustScore, complianceScore, growthRationale, entityLinkage), schemaJsonld, schemaCommentary, validation (errors, warnings, suggestions).
      `;

      let userContent = '';
      if (isUrl && typeof input === 'string') {
        userContent = `Perform an Enterprise Growth Audit for this URL: ${input}`;
      } else if (typeof input === 'object' && input.data) {
        userContent = `Deep-dive analysis of the attached document. Extract core message and technical SEO requirements.`;
      } else {
        userContent = `Semantic analysis of provided content: ${typeof input === 'string' ? input.substring(0, 20000) : JSON.stringify(input)}`;
      }

      const geminiConfig = {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
      };

      if (isUrl) {
        geminiConfig.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        config: geminiConfig
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Gemini returned empty response.");

      let data = JSON.parse(resultText);
      if (typeof data.schemaJsonld === 'string') {
        try { data.schemaJsonld = JSON.parse(data.schemaJsonld); } catch (e) {}
      }

      const groundingSources = [];
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        groundingMetadata.groundingChunks.forEach(chunk => {
          if (chunk.web) groundingSources.push({ title: chunk.web.title || 'Source', uri: chunk.web.uri });
        });
      }

      res.json({
        data: JSON.stringify(data),
        groundingSources
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
      max_tokens: 8000  // Increased to allow full schema with multiple FAQs
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

// 7. Simple SEO Generation - Variants Only (No Schema)
app.post('/api/generate-simple', async (req, res) => {
  try {
    const { content, contentType, profile, modelProvider } = req.body;

    if (!content || !profile) {
      return res.status(400).json({ error: 'Invalid request: content and profile required' });
    }

    const provider = modelProvider || 'openai';
    const ai = provider === 'gemini' ? getGeminiInstance() : null;
    const openai = provider === 'openai' ? getOpenAIInstance() : null;

    const brandContext = `
      BRAND CONTEXT: ${profile.legalName} (${profile.name})
      - Website: https://${profile.domain}/
      - Logo: ${profile.logoUrl}
      - Org Type: ${profile.orgType}
    `;

    const contentTypeLabels = {
      campaign: 'Marketing Campaign',
      page: 'Web Page',
      terms: 'Terms & Conditions',
      press: 'Press Release',
      offer: 'Offer/Deal',
      other: 'General Content'
    };

    const systemPrompt = `
      You are an expert SEO specialist. Analyze the provided ${contentTypeLabels[contentType] || 'content'} and generate 3 distinct SEO-optimized variants.

      ${brandContext}

      ### YOUR TASK:
      1. Analyze the content to understand its purpose, key messages, and target audience
      2. Extract the core value propositions and unique selling points
      3. Generate EXACTLY 3 distinct SEO variants, each optimized for different search intents or user personas
      4. For EACH variant, suggest an appropriate target URL slug based on the content focus

      ### VARIANT REQUIREMENTS:
      Each variant must have:
      - **H1**: Compelling, keyword-rich headline (50-60 characters)
      - **Meta Title**: SEO-optimized title tag (50-60 characters)
      - **Meta Description**: Persuasive description (150-160 characters)
      - **URL**: Suggested URL path/slug for this variant (e.g., "/personal-banking/platinum-card", "/offers/summer-promo-2025")
      - **Keyphrases**: 5-7 target keywords/phrases relevant to this variant
      - **Rationale**: Why this approach works for SEO
      - **Best For**: Target audience or use case for this variant
      - **Justification**: Technical SEO justification
      - **Situational Comparison**: How this variant differs from the others

      ### URL GUIDELINES (CRITICAL - URLs MUST BE SEO-PERFECT):
      URLs are CRUCIAL for SEO and must match user search intent. Follow these rules strictly:

      1. **Structure**: Use clear hierarchy based on content type
         - Campaigns/Offers: /en/offers/{product-name-benefit}
         - Product Pages: /en/{category}/{product-name}
         - Applications: /en/apply/{product-name}
         - Examples:
           * /en/offers/skywards-black-75k-bonus-miles
           * /en/offers/platinum-cashback-bonus
           * /en/credit-cards/infinite-rewards
           * /en/apply/sme-business-loan

      2. **Include Benefit Terms**: MUST include the actual benefit in the URL for campaigns/offers
         - Use compound search terms like "bonus-miles", "bonus-points", "cashback-bonus"
         - If brief mentions "75000 bonus miles", URL should include "75k-bonus-miles"
         - If brief mentions "cashback", URL should include "cashback" or "cashback-bonus"
         - If brief mentions "rewards", URL should include "rewards" or "bonus-rewards"
         - Examples:
           * Brief: "Get 50000 bonus points" → /en/offers/card-name-50k-bonus-points
           * Brief: "5% cashback on all purchases" → /en/offers/card-name-5-cashback
           * Brief: "Free lounge access" → /en/offers/card-name-lounge-access

      3. **Use Numbers Wisely**: Abbreviate large numbers for brevity
         - 75000 → 75k
         - 100000 → 100k
         - 5% → 5-percent (only if crucial to differentiate)

      4. **Length**: Keep URLs concise but descriptive (4-5 segments ideal, max 50 characters)
         - ✅ Good: /en/offers/skywards-black-75k-bonus-miles (45 chars)
         - ✅ Good: /en/apply/platinum-credit-card (33 chars)
         - ❌ Bad: /en/special-limited-time-offers/skywards-black-credit-card-with-bonus-miles (81 chars)

      5. **Each Variant MUST Have Different URL**: Reflect unique focus/angle
         - Variant 1 (bonus miles focus): /en/offers/skywards-black-75k-bonus-miles
         - Variant 2 (travel benefits focus): /en/offers/skywards-black-travel-benefits
         - Variant 3 (application focus): /en/apply/skywards-black-credit-card

      6. **Brand-Specific Patterns**:
         - Emirates NBD: /en/{category}/{product-benefit}
         - Emirates Islamic: /en/{category}/{product-benefit}
         - Always start with /en/ for these brands

      7. **Search Intent Matching**: URL MUST match what users actually search for
         - Users search: "skywards black 75000 bonus miles"
         - URL should be: /en/offers/skywards-black-75k-bonus-miles
         - NOT: /en/offers/skywards-black-bonus (missing "miles")
         - NOT: /en/credit-cards/skywards-black (missing benefit)

      ### CRITICAL RULES:
      - Generate EXACTLY 3 variants (no more, no less)
      - Each variant should target a different angle/persona
      - For Emirates Islamic content: Use "Profit Rate" instead of "Interest Rate"
      - For Emirates Islamic content: Include Islamic finance terminology in keyphrases when relevant
      - URLs must be unique for each variant
      - NO schema generation needed
      - NO strategic impact scores needed

      Return a valid JSON object with this structure:
      {
        "seoVariants": [
          {
            "h1": "string",
            "metaTitle": "string",
            "metaDescription": "string",
            "url": "string (full URL path starting with /)",
            "keyphrases": ["string"],
            "rationale": "string",
            "bestFor": "string",
            "justification": "string",
            "situationalComparison": "string"
          }
        ],
        "aiRecommendation": {
          "winnerIndex": 0,
          "expertRationale": "string (explain why this variant is recommended)",
          "comparisonNotes": "string (how variants compare to each other)"
        }
      }
    `;

    const userPrompt = `Content Type: ${contentTypeLabels[contentType] || 'General'}

Content to Analyze:
${content}

Generate 3 SEO-optimized variants with unique URLs for this content.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const resultText = completion.choices[0].message.content;
    const data = JSON.parse(resultText);

    // Validate that we got exactly 3 variants
    if (!data.seoVariants || data.seoVariants.length !== 3) {
      throw new Error('AI did not generate exactly 3 variants');
    }

    // Ensure all variants have URLs
    data.seoVariants.forEach((variant, idx) => {
      if (!variant.url) {
        // Generate fallback URL if missing
        variant.url = `/content/variant-${idx + 1}`;
      }
    });

    res.json(data);

  } catch (error) {
    console.error('Simple SEO Generation Error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || 'Simple SEO generation failed',
      code: status
    });
  }
});

app.listen(PORT, () => {
  console.log(`SECURE BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`GEMINI API KEY: ${process.env.API_KEY ? 'ACTIVE' : 'MISSING'}`);
  console.log(`OPENAI API KEY: ${process.env.OPENAI_API_KEY ? 'ACTIVE' : 'MISSING'}`);
});
