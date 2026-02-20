/**
 * Banking Schema Specification
 * Implementation of schema-recommendation-spec.md for ENBD & Emirates Islamic
 *
 * This module provides:
 * - Channel-specific entity presets (ENBD & EI)
 * - Page type detection logic
 * - Node selection rules
 * - AlternateName mapping for Islamic finance
 * - Template builders for all schema types
 */

export const BANKING_CHANNELS = {
  ENBD: 'ENBD',
  EI: 'EI'
} as const;

export type BankingChannel = typeof BANKING_CHANNELS[keyof typeof BANKING_CHANNELS];

// Page Type Detection Signals
export const PAGE_TYPE_SIGNALS = {
  ProductPage: ['credit card', 'account', 'loan', 'finance', 'mortgage', 'deposit', 'personal finance', 'home finance', 'auto finance', 'savings'],
  CampaignPage: ['offer', 'limited time', 'apply now', 'promotion', 'win', 'cashback', 'exclusive deal', 'seasonal'],
  PressRelease: ['announces', 'launched', 'partnership', 'award', 'milestone', 'appointed', 'signed'],
  BlogArticle: ['guide', 'tips', 'how to', 'explained', 'what is', 'vs', 'comparison', 'understanding', 'top 5', 'top 10'],
  BranchPage: ['branch', 'location', 'ATM', 'address', 'opening hours', 'find us'],
  SupportPage: ['help', 'FAQ', 'contact us', 'documents required', 'how do I', 'support'],
  ListingPage: ['all credit cards', 'compare cards', 'all accounts', 'full list', 'browse']
};

// ENBD Organization Preset
export const ENBD_ORGANIZATION = {
  "@type": "Organization",
  "@id": "https://www.emiratesnbd.com/#organization",
  "name": "Emirates NBD",
  "alternateName": [
    "ENBD",
    "Emirates NBD Bank",
    "Emirates National Bank of Dubai",
    "Emirates NBD PJSC"
  ],
  "url": "https://www.emiratesnbd.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.emiratesnbd.com/assets/en/images/logo.svg",
    "width": 200,
    "height": 60
  },
  "description": "Emirates NBD is one of the leading banking groups in the Middle East and North Africa, headquartered in Dubai, UAE, offering retail, corporate, Islamic and investment banking services.",
  "foundingDate": "2007",
  "areaServed": {
    "@type": "Country",
    "name": "United Arab Emirates"
  },
  "sameAs": [
    "https://en.wikipedia.org/wiki/Emirates_NBD",
    "https://www.linkedin.com/company/emirates-nbd",
    "https://twitter.com/emiratesnbd",
    "https://www.facebook.com/EmiratesNBD",
    "https://www.wikidata.org/wiki/Q5372506"
  ]
};

// Emirates Islamic Organization Preset
export const EI_ORGANIZATION = {
  "@type": "Organization",
  "@id": "https://www.emiratesislamic.ae/#organization",
  "name": "Emirates Islamic",
  "alternateName": [
    "EI",
    "Emirates Islamic Bank",
    "Emirates Islamic PJSC",
    "EIB",
    "Emirates Islamic Financial Institution",
    "Emirates NBD Islamic Banking Arm",
    "Emirates Islamic – Sharia Compliant Banking"
  ],
  "url": "https://www.emiratesislamic.ae",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.emiratesislamic.ae/-/media/ei/images/header/emirates-islamic-logo.svg",
    "width": 200,
    "height": 60
  },
  "description": "Emirates Islamic is a leading Islamic bank in the UAE, offering Sharia-compliant retail and corporate banking products including financing, savings, cards, and investment solutions.",
  "foundingDate": "2004",
  "areaServed": {
    "@type": "Country",
    "name": "United Arab Emirates"
  },
  "sameAs": [
    "https://en.wikipedia.org/wiki/Emirates_Islamic_Bank",
    "https://www.linkedin.com/company/emirates-islamic",
    "https://www.twitter.com/emiratesislamic",
    "https://www.wikidata.org/wiki/Q5372510"
  ]
};

// Generic Credit Card AlternateNames (both channels)
export const GENERIC_CREDIT_CARD_ALIASES = [
  "travel credit card UAE",
  "Skywards miles card",
  "Emirates miles credit card",
  "premium travel card UAE",
  "airport lounge card UAE",
  "Visa Infinite card UAE",
  "best travel credit card UAE",
  "rewards credit card UAE"
];

// Islamic Finance AlternateNames (EI channel only)
export const ISLAMIC_CREDIT_CARD_ALIASES = [
  "Islamic credit card UAE",
  "Sharia compliant credit card",
  "halal credit card UAE",
  "Islamic finance card",
  "Murabaha credit card",
  "Islamic travel card UAE",
  "Emirates Islamic finance card",
  "profit rate card UAE",
  "no interest credit card UAE"
];

// Islamic Finance Product Mapping
export const ISLAMIC_FINANCE_MAPPING = {
  'home finance': {
    islamicTerm: ['Ijara', 'Murabaha'],
    conventionalAliases: ['mortgage', 'home loan', 'property loan', 'housing loan UAE']
  },
  'personal finance': {
    islamicTerm: ['Murabaha'],
    conventionalAliases: ['personal loan', 'cash loan', 'unsecured loan UAE']
  },
  'auto finance': {
    islamicTerm: ['Murabaha', 'Ijara'],
    conventionalAliases: ['car loan', 'auto loan', 'vehicle finance UAE']
  },
  'savings account': {
    islamicTerm: ['Mudaraba'],
    conventionalAliases: ['savings account', 'deposit account', 'interest-free savings']
  },
  'fixed deposit': {
    islamicTerm: ['Wakala'],
    conventionalAliases: ['fixed deposit', 'term deposit', 'investment account UAE']
  },
  'business finance': {
    islamicTerm: ['Musharaka', 'Murabaha'],
    conventionalAliases: ['business loan', 'SME loan', 'corporate finance UAE']
  },
  'current account': {
    islamicTerm: ['Qard'],
    conventionalAliases: ['current account', 'checking account', 'bank account UAE']
  },
  'credit card': {
    islamicTerm: ['Murabaha-based card'],
    conventionalAliases: ['credit card', 'rewards card', 'charge card']
  }
};

/**
 * Detect banking channel from domain
 */
export function detectChannel(url: string): BankingChannel {
  const domain = url.toLowerCase();
  if (domain.includes('emiratesislamic.ae') || domain.includes('ei.ae')) {
    return BANKING_CHANNELS.EI;
  }
  return BANKING_CHANNELS.ENBD;
}

/**
 * Detect page type from content signals
 */
export function detectPageType(content: string): string {
  const lowerContent = content.toLowerCase();

  // Check in priority order
  for (const [pageType, signals] of Object.entries(PAGE_TYPE_SIGNALS)) {
    for (const signal of signals) {
      if (lowerContent.includes(signal.toLowerCase())) {
        return pageType;
      }
    }
  }

  return 'WebPage'; // Default
}

/**
 * Get organization preset for channel
 */
export function getOrganization(channel: BankingChannel): any {
  return channel === BANKING_CHANNELS.EI ? EI_ORGANIZATION : ENBD_ORGANIZATION;
}

/**
 * Get website node for channel
 */
export function getWebSite(channel: BankingChannel): any {
  const baseUrl = channel === BANKING_CHANNELS.EI
    ? 'https://www.emiratesislamic.ae'
    : 'https://www.emiratesnbd.com';

  return {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": channel === BANKING_CHANNELS.EI ? "Emirates Islamic" : "Emirates NBD",
    "publisher": { "@id": `${baseUrl}/#organization` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate AlternateName for product based on channel and type
 */
export function generateAlternateNames(
  productType: string,
  channel: BankingChannel,
  productName: string
): string[] {
  const aliases: string[] = [];
  const lowerType = productType.toLowerCase();

  // Add generic aliases based on product type
  if (lowerType.includes('credit card') || lowerType.includes('card')) {
    aliases.push(...GENERIC_CREDIT_CARD_ALIASES);

    // Add Islamic finance aliases for EI channel
    if (channel === BANKING_CHANNELS.EI) {
      aliases.push(...ISLAMIC_CREDIT_CARD_ALIASES);
    }
  }

  // Add Islamic finance mapping for EI channel
  if (channel === BANKING_CHANNELS.EI) {
    for (const [key, mapping] of Object.entries(ISLAMIC_FINANCE_MAPPING)) {
      if (lowerType.includes(key)) {
        aliases.push(...mapping.conventionalAliases);
        aliases.push(...mapping.islamicTerm.map(term => `${term} ${productType}`));
      }
    }
  }

  // Add product name variations
  aliases.push(`${productName} UAE`);
  aliases.push(`${productName} Dubai`);

  return [...new Set(aliases)]; // Remove duplicates
}

/**
 * Build schema ID anchor
 */
export function buildId(pageUrl: string, anchor: string): string {
  // Organization and WebSite use trailing slash before hash
  if (anchor === 'organization' || anchor === 'website') {
    const baseUrl = pageUrl.split('?')[0].split('#')[0];
    const domain = baseUrl.match(/^https?:\/\/[^\/]+/)?.[0] || baseUrl;
    return `${domain}/#${anchor}`;
  }

  // All other nodes don't use trailing slash
  const cleanUrl = pageUrl.split('?')[0].split('#')[0];
  return `${cleanUrl}#${anchor}`;
}

/**
 * Banking-specific schema instruction for AI
 */
export const BANKING_SCHEMA_INSTRUCTION = `
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
- FinancialProduct + Product (dual type)
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
  * Credit Card → add "Islamic credit card", "Sharia compliant", "Murabaha card"
  * Home Finance → add "Ijara", "Murabaha", "Islamic mortgage"
  * Personal Finance → add "Murabaha personal finance"
  * Savings → add "Mudaraba savings account"
  * Business Finance → add "Musharaka", "Islamic business finance"

### 5. @ID ANCHOR PATTERNS
Use these exact patterns:
- Organization: https://www.emiratesnbd.com/#organization
- WebSite: https://www.emiratesnbd.com/#website
- WebPage: [PAGE_URL]#webpage (no trailing slash before #)
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

### 8. FAQ GENERATION
If content has Q&A section, extract it.
If not, generate minimum 3 relevant FAQs like:
- "What is the [Product Name]?"
- "What are the fees for [Product Name]?"
- "How do I apply for [Product Name]?"
- "Is [Product Name] Sharia compliant?" (for EI only)

### 9. HOWTO STRUCTURE
**HowTo – Apply** (always for products):
Step 1: Check Eligibility
Step 2: Prepare Documents
Step 3: Submit Online Application
Step 4: Upload Documents
Step 5: Await Approval
Step 6: Activate Card/Account

**HowTo – Usage/Rewards** (only if rewards exist):
Step 1: Spend on Your Card
Step 2: Track Your Miles/Points
Step 3: Redeem for Flights/Rewards
Step 4: Claim Welcome Bonus

Return the complete @graph structure as a JSON object, not a string.
`;
