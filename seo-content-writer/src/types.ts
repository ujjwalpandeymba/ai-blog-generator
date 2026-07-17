export interface SEOInputs {
  primaryKeyword: string;
  secondaryKeywords: string[];
  companyName: string;
  brandName: string;
  productName: string;
  targetAudience: string;
  searchIntent: string;
  wordCount: number;
  location: string;
  productInformation: string;
  cta: string;
}

export interface BlogSection {
  title: string;
  level: number; // 2 or 3
  content: string;
  anchor: string;
}

export interface BlogFAQ {
  question: string;
  answer: string;
}

export interface BlogDraft {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  inputs: SEOInputs;
  seoTitle: string;
  metaDescription: string;
  urlSlug: string;
  introduction: string;
  tableOfContents: { anchor: string; title: string }[];
  sections: BlogSection[];
  conclusion: string;
  faqs: BlogFAQ[];
  ctaSection: {
    ctaTitle: string;
    ctaBody: string;
  };
  internalLinkOpportunities: string[];
  schemaMarkupType: string;
  imageAltTexts: string[];
}

export interface SEOChecklistResult {
  rule: string;
  passed: boolean;
  message: string;
  category: "Length" | "Keywords" | "Readability" | "Banned Terms" | "Formatting";
  value?: string | number;
}
