
export enum PageType {
  PRODUCT = 'product',
  CAMPAIGN = 'campaign',
  OFFER = 'offer',
  PRESS_RELEASE = 'press_release',
  GENERIC = 'generic'
}

export enum ModelProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai'
}

export interface StrategicImpact {
  visibilityScore: number;
  trustScore: number;
  complianceScore: number;
  growthRationale: string;
  entityLinkage: string[]; // e.g. ["BankOrCreditUnion", "FinancialProduct", "FAQPage"]
}

export interface BrandProfile {
  id: string;
  name: string;
  legalName: string;
  orgType: string;
  domain: string;
  logoUrl: string;
  address: string[];
  contactPoints: { type: string; value: string }[];
  sameAs: string[];
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
}

export interface SEOVariant {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keyphrases: string[];
  rationale: string;
  bestFor: string;
  justification: string;
  situationalComparison: string;
  isEnhanced?: boolean; // Added via chat assistant
}

export interface AIRecommendation {
  winnerIndex: number;
  expertRationale: string;
  comparisonNotes: string;
}

export interface ValidationSummary {
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Generation {
  id: string;
  timestamp: number;
  url: string;
  profileId: string;
  pageType: PageType;
  modelProvider: ModelProvider;
  extracted: {
    titleCurrent: string;
    metaCurrent: string;
    h1Current: string;
    headings: string[];
    mainTextPreview: string;
  };
  seoVariants: SEOVariant[];
  aiRecommendation?: AIRecommendation;
  strategicImpact?: StrategicImpact; // New wow factor field
  schemaJsonld: any;
  schemaCommentary?: string;
  validation: ValidationSummary;
  groundingSources?: GroundingSource[];
}

export type ViewState = 'login' | 'dashboard' | 'results' | 'history';
