import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Flame,
  Settings,
  Sparkles,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Languages,
  BookOpen,
  MousePointer,
  Link,
  Image as ImageIcon,
  Edit,
  Sliders,
  Maximize2,
  Minimize2,
  FileSpreadsheet
} from "lucide-react";
import { BlogDraft, BlogSection, SEOInputs, SEOChecklistResult } from "./types";

// Creative templates to let users experience the writer instantly
const PRESET_TEMPLATES = [
  {
    name: "Sustainable Roasting Guide",
    inputs: {
      primaryKeyword: "sustainable coffee roasting",
      secondaryKeywords: ["fair trade coffee", "ethical sourcing", "small batch process"],
      companyName: "Roast & Bloom Co.",
      brandName: "Roast & Bloom",
      productName: "Eco-Stream Thermal Roaster",
      targetAudience: "Eco-conscious homeowners & amateur baristas",
      searchIntent: "Informative / Educational",
      wordCount: 1200,
      location: "North America",
      productInformation: "An advanced, energy-efficient coffee roaster that reduces household gas usage by 30% without sacrificing profile depth. Made from 100% recycled carbon steel with an innovative smoke filter.",
      cta: "Pre-order your Eco-Stream thermal roaster today and receive premium organic green beans for free."
    }
  },
  {
    name: "SaaS Devops Scaling",
    inputs: {
      primaryKeyword: "kubernetes autoscaling strategies",
      secondaryKeywords: ["horizontal pod autoscaler", "cloud waste reduction", "zero downtime deployment"],
      companyName: "OpsVantage",
      brandName: "OpsVantage",
      productName: "KubeStream Optimizer",
      targetAudience: "Site Reliability Engineers & tech managers",
      searchIntent: "Transactional / Professional technical manual",
      wordCount: 1500,
      location: "Global",
      productInformation: "A next-step automated continuous Kubernetes autoscaler powered by machine-learning models predicting burst traffic before it hits origin servers. Minimizes cluster overhead by 40%.",
      cta: "Schedule a free 15-minute KubeStream assessment to audit your node reservation structures today."
    }
  },
  {
    name: "Indoor Gardening & Botanics",
    inputs: {
      primaryKeyword: "indoor fiddle leaf fig care",
      secondaryKeywords: ["prevent root rot", "foliage fertilizer guide", "best potting soil"],
      companyName: "Sprout & Spade Botanicals",
      brandName: "Sprout & Spade",
      productName: "Signature Leaf Revival Serum",
      targetAudience: "Urban plant collectors & home interior lovers",
      searchIntent: "Educational beginner guide",
      wordCount: 800,
      location: "United Kingdom",
      productInformation: "A specialty biological foliar spray designed for high-humidity indoor plants. Delivers critical micronutrients directly to leaves, helping reverse brown spot damages and stimulating growth.",
      cta: "Treat your tropical greens to our Signature Leaf Revival Serum and get free shipping across the UK."
    }
  }
];

export default function App() {
  const [inputs, setInputs] = useState<SEOInputs>({
    primaryKeyword: "sustainable coffee roasting",
    secondaryKeywords: ["fair trade coffee", "ethical sourcing", "small batch process"],
    companyName: "Roast & Bloom Co.",
    brandName: "Roast & Bloom",
    productName: "Eco-Stream Thermal Roaster",
    targetAudience: "Eco-conscious homeowners & amateur baristas",
    searchIntent: "Informative / Educational",
    wordCount: 1200,
    location: "North America",
    productInformation: "An advanced, energy-efficient coffee roaster that reduces household gas usage by 30% without sacrificing profile depth. Made from 100% recycled carbon steel with an innovative smoke filter.",
    cta: "Pre-order your Eco-Stream thermal roaster today and receive premium organic green beans for free."
  });

  const [newSecKeyword, setNewSecKeyword] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<BlogDraft | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<BlogDraft[]>([]);
  const [activeTab, setActiveTab] = useState<"preview" | "seo" | "schema" | "marketing">("preview");
  const [customWordCount, setCustomWordCount] = useState<number>(0);
  const [customDensity, setCustomDensity] = useState<number>(0);
  const [activeVoicePct, setActiveVoicePct] = useState<number>(0);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Tweak Section States
  const [tweakingSectionIndex, setTweakingSectionIndex] = useState<number | null>(null);
  const [tweakInstructions, setTweakInstructions] = useState("");
  const [isTweaking, setIsTweaking] = useState(false);
  
  // App UI panels
  const [leftPanelMode, setLeftPanelMode] = useState<"editor" | "library">("editor");
  const [copiedSectionIndex, setCopiedSectionIndex] = useState<number | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [seoChecklist, setSeoChecklist] = useState<SEOChecklistResult[]>([]);
  const [fleschReadingEase, setFleschReadingEase] = useState<number>(65);
  const [fleschKincaidGrade, setFleschKincaidGrade] = useState<number>(8.0);
  const [highlightComplexSentences, setHighlightComplexSentences] = useState<boolean>(true);
  const [simplifyingIndex, setSimplifyingIndex] = useState<number | null>(null);

  // On mount, load drafts from storage
  useEffect(() => {
    const saved = localStorage.getItem("lexiflow_saved_drafts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedDrafts(parsed);
        if (parsed.length > 0) {
          setCurrentDraft(parsed[0]);
          setInputs(parsed[0].inputs);
        }
      } catch (e) {
        console.error("Error reading saved drafts: ", e);
      }
    }
  }, []);

  // Whenever draft changes, run real-time SEO metrics
  useEffect(() => {
    if (!currentDraft) {
      setSeoChecklist([]);
      return;
    }
    analyzeDraft(currentDraft);
  }, [currentDraft]);

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setInputs(preset.inputs);
  };

  const handleAddSecondaryKeyword = () => {
    const trimmed = newSecKeyword.trim().toLowerCase();
    if (trimmed && !inputs.secondaryKeywords.includes(trimmed)) {
      setInputs({
        ...inputs,
        secondaryKeywords: [...inputs.secondaryKeywords, trimmed]
      });
      setNewSecKeyword("");
    }
  };

  const handleRemoveSecondaryKeyword = (kw: string) => {
    setInputs({
      ...inputs,
      secondaryKeywords: inputs.secondaryKeywords.filter(k => k !== kw)
    });
  };

  const handleSaveDraft = (draft: BlogDraft) => {
    const exists = savedDrafts.find(d => d.id === draft.id);
    let updated;
    if (exists) {
      updated = savedDrafts.map(d => d.id === draft.id ? draft : d);
    } else {
      updated = [draft, ...savedDrafts];
    }
    setSavedDrafts(updated);
    localStorage.setItem("lexiflow_saved_drafts", JSON.stringify(updated));
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated);
    localStorage.setItem("lexiflow_saved_drafts", JSON.stringify(updated));
    if (currentDraft?.id === id) {
      setCurrentDraft(updated[0] || null);
    }
  };

  const handleGenerateBlog = async () => {
    setGenerating(true);
    setApiError(null);
    try {
      const response = await fetch("/api/write-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs)
      });
      
      if (!response.ok) {
        let errMsg = "Generation failure. Please check API Key status.";
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const generatedData = await response.json();
      
      const draftId = `draft_${Date.now()}`;
      const newDraft: BlogDraft = {
        id: draftId,
        title: `${generatedData.seoTitle.slice(0, 30)}...`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputs: { ...inputs },
        ...generatedData
      };

      setCurrentDraft(newDraft);
      handleSaveDraft(newDraft);
    } catch (e: any) {
      setApiError(e.message || "Unknown error occurred during generation");
    } finally {
      setGenerating(false);
    }
  };

  const handleTweakSection = async () => {
    if (tweakingSectionIndex === null || !currentDraft) return;
    
    setIsTweaking(true);
    setApiError(null);
    try {
      const section = currentDraft.sections[tweakingSectionIndex];
      const response = await fetch("/api/tweak-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: section.title,
          originalContent: section.content,
          instructions: tweakInstructions,
          primaryKeyword: currentDraft.inputs.primaryKeyword,
          secondaryKeywords: currentDraft.inputs.secondaryKeywords
        })
      });

      if (!response.ok) {
        let errMsg = "Unable to optimize this section. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const json = await response.json();
      
      // Update inline content
      const updatedSections = [...currentDraft.sections];
      updatedSections[tweakingSectionIndex] = {
        ...section,
        content: json.content
      };

      const updatedDraft: BlogDraft = {
        ...currentDraft,
        sections: updatedSections,
        updatedAt: new Date().toISOString()
      };

      setCurrentDraft(updatedDraft);
      handleSaveDraft(updatedDraft);
      
      // Success reset
      setTweakingSectionIndex(null);
      setTweakInstructions("");
    } catch (e: any) {
      setApiError(e.message || "Unknown error during section tweaking");
    } finally {
      setIsTweaking(false);
    }
  };

  const handleAutoSimplifySection = async (sectionIndex: number) => {
    if (!currentDraft) return;
    setSimplifyingIndex(sectionIndex);
    setApiError(null);
    try {
      const section = currentDraft.sections[sectionIndex];
      const simplifyPrompt = "Simplify this section content. Identify long, complex sentences and rephrase them into shorter, punchy, and clear sentences. Ensure maximum clarity, readability (target Grade 7-9 level or a plain high-conversion conversational flow), and keep all original factual details and search terms intact. Return ONLY the rewritten text. Absolutely do not include any markdown format titles, intros, or introductory/conversational remarks.";

      const response = await fetch("/api/tweak-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: section.title,
          originalContent: section.content,
          instructions: simplifyPrompt,
          primaryKeyword: currentDraft.inputs.primaryKeyword,
          secondaryKeywords: currentDraft.inputs.secondaryKeywords
        })
      });

      if (!response.ok) {
        let errMsg = "Unable to automatically simplify this section. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const json = await response.json();
      
      // Update inline content
      const updatedSections = [...currentDraft.sections];
      updatedSections[sectionIndex] = {
        ...section,
        content: json.content
      };

      const updatedDraft: BlogDraft = {
        ...currentDraft,
        sections: updatedSections,
        updatedAt: new Date().toISOString()
      };

      setCurrentDraft(updatedDraft);
      handleSaveDraft(updatedDraft);
    } catch (e: any) {
      setApiError(e.message || "Unknown error during section auto-simplification");
    } finally {
      setSimplifyingIndex(null);
    }
  };

  const analyzeDraft = (draft: BlogDraft) => {
    // 1. Gather all body content
    const allTextParts = [
      draft.introduction,
      ...draft.sections.map(s => s.content),
      draft.conclusion,
      ...draft.faqs.map(f => f.question + " " + f.answer),
      draft.ctaSection.ctaBody
    ];
    const fullText = allTextParts.join(" ").toLowerCase();
    const rawFullText = allTextParts.join(" ");
    
    // Count exact or close word occurrences
    const wordList = fullText.match(/\b\w+\b/g) || [];
    const wordCountTotal = wordList.length;
    setCustomWordCount(wordCountTotal);

    // Calculate Primary Keyword frequency and density
    const pk = draft.inputs.primaryKeyword.toLowerCase();
    
    // Build regex to look for exact keyword occurrence securely
    const escapedPK = pk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let pkMatches = 0;
    try {
      const pkRegex = new RegExp(`\\b${escapedPK}\\b`, 'gi');
      pkMatches = (fullText.match(pkRegex) || []).length;
    } catch (e) {
      // Fallback simple split count
      pkMatches = fullText.split(pk).length - 1;
    }
    
    const calculatedDensity = wordCountTotal > 0 ? (pkMatches / wordCountTotal) * 100 : 0;
    setCustomDensity(calculatedDensity);

    // AI signature Banned Words Heuristic
    const bannedPatterns = [
      { term: "in today's fast-paced world", label: "In today's fast-paced world" },
      { term: "in conclusion", label: "In conclusion" },
      { term: "furthermore", label: "Furthermore" },
      { term: "moreover", label: "Moreover" },
      { term: "delve into", label: "Delve into" },
      { term: "unlock the power of", label: "Unlock the power of" },
      { term: "in this digital age", label: "In this digital age" },
      { term: "it's important to remember", label: "It's important to remember" }
    ];

    const foundBanned: string[] = [];
    bannedPatterns.forEach(pattern => {
      if (fullText.includes(pattern.term)) {
        foundBanned.push(pattern.label);
      }
    });

    // Simple Active Voice checker replacement
    // Look at relative auxiliary verbs like "was created by", "is used by", "by the user"
    const passiveMarkers = /\b(is|am|are|was|were|be|been|being)\s+\w+ed\s+by\b|\bby\s+(us|them|the|him|her)\b/g;
    const totalSentences = (draft.introduction + " " + draft.conclusion).split(/[.!?]+/).length || 10;
    const passivePhrasesCount = (fullText.match(passiveMarkers) || []).length;
    const activeVoiceHeuristic = Math.max(72, Math.min(98, 100 - Math.round((passivePhrasesCount / totalSentences) * 100)));
    setActiveVoicePct(activeVoiceHeuristic);

    // Flesch-Kincaid Readability scoring calculations context
    const cleanWordList = rawFullText.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const wordsCountForFK = Math.max(1, cleanWordList.length);
    
    // Count sentences by looking for punctuation followed directly by space/line/end
    const sentenceSplit = rawFullText.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0);
    const sentenceCountTotal = Math.max(1, sentenceSplit.length);

    // Syllables count metric generator
    let syllablesCountTotal = 0;
    for (const word of cleanWordList) {
      const cleanW = word.replace(/[^a-z]/g, "");
      if (!cleanW) continue;
      if (cleanW.length <= 3) {
        syllablesCountTotal += 1;
        continue;
      }
      const vowelGroups = cleanW.match(/[aeiouy]+/g);
      let count = vowelGroups ? vowelGroups.length : 0;
      if (cleanW.endsWith("e")) {
        const beforeE = cleanW.charAt(cleanW.length - 2);
        // Ends in -le preceded by a consonant (like "table", "middle") has special sound
        const isLe = beforeE === "l" && cleanW.length > 2 && !/[aeiouy]/.test(cleanW.charAt(cleanW.length - 3));
        if (!isLe) {
          count--;
        }
      }
      syllablesCountTotal += Math.max(1, count);
    }

    // Formulas
    const freRaw = 206.835 - 1.015 * (wordsCountForFK / sentenceCountTotal) - 84.6 * (syllablesCountTotal / wordsCountForFK);
    const calculatedFRE = Math.max(0, Math.min(100, freRaw));
    
    const fkgRaw = 0.39 * (wordsCountForFK / sentenceCountTotal) + 11.8 * (syllablesCountTotal / wordsCountForFK) - 15.59;
    const calculatedFKG = Math.max(1, Math.min(18, fkgRaw));

    setFleschReadingEase(calculatedFRE);
    setFleschKincaidGrade(calculatedFKG);

    // Adapt readability thresholds flexibly based on target audience specifications
    const targetAud = (draft.inputs.targetAudience || "").toLowerCase();
    let targetEaseMin = 55; // default is standard broad public ease
    let targetCriteriaText = "Standard (55+)";
    let targetAudienceFriendly = "Standard Reader";

    if (targetAud.includes("expert") || targetAud.includes("pro") || targetAud.includes("developer") || targetAud.includes("engineer") || targetAud.includes("academic") || targetAud.includes("scientific")) {
      targetEaseMin = 35; // advanced readers don't mind lower ease scores
      targetCriteriaText = "Technical / Expert (35+)";
      targetAudienceFriendly = "Technical Specialists";
    } else if (targetAud.includes("beginner") || targetAud.includes("child") || targetAud.includes("elementary") || targetAud.includes("simple") || targetAud.includes("easy") || targetAud.includes("novel")) {
      targetEaseMin = 70; // requires clear conversational format
      targetCriteriaText = "Accessible / Beginner (70+)";
      targetAudienceFriendly = "Beginners or Students";
    }

    const readabilityRulePassed = calculatedFRE >= targetEaseMin;

    // Evaluate Checklists
    const checklist: SEOChecklistResult[] = [
      {
        rule: "SEO Title length check",
        passed: draft.seoTitle.length <= 60 && draft.seoTitle.length > 25,
        message: draft.seoTitle.length <= 60 
          ? `Ideal title length (${draft.seoTitle.length} / 60 characters).`
          : `SEO Title is long (${draft.seoTitle.length} characters). Google might truncate it.`,
        category: "Length",
        value: `${draft.seoTitle.length} chars`
      },
      {
        rule: "Meta Description length criteria",
        passed: draft.metaDescription.length >= 140 && draft.metaDescription.length <= 165,
        message: draft.metaDescription.length >= 140 && draft.metaDescription.length <= 165
          ? `Perfect meta description length (${draft.metaDescription.length} characters).`
          : `Meta length is ${draft.metaDescription.length} chars. Should ideally be 150-160.`,
        category: "Length",
        value: `${draft.metaDescription.length} chars`
      },
      {
        rule: "Target Word Count fulfillment",
        passed: wordCountTotal >= draft.inputs.wordCount - 150,
        message: wordCountTotal >= draft.inputs.wordCount - 150
          ? `Achieved requested length (${wordCountTotal} generated words vs ${draft.inputs.wordCount} target).`
          : `A bit short of target size (${wordCountTotal} generated vs ${draft.inputs.wordCount} target).`,
        category: "Length",
        value: `${wordCountTotal} words`
      },
      {
        rule: "Primary Keyword Density",
        passed: calculatedDensity >= 0.6 && calculatedDensity <= 1.8,
        message: calculatedDensity >= 0.6 && calculatedDensity <= 1.8
          ? `Exceptional density score (${calculatedDensity.toFixed(2)}%). Sounds human-written and optimal.`
          : `Primary Density is ${calculatedDensity.toFixed(2)}%. Recommends range 0.8% - 1.5%.`,
        category: "Keywords",
        value: `${calculatedDensity.toFixed(2)}%`
      },
      {
        rule: "No Robotic AI transitions found",
        passed: foundBanned.length === 0,
        message: foundBanned.length === 0
          ? "No banned words or robotic AI templates detected."
          : `Found AI marker transitions: "${foundBanned.slice(0, 2).join('", "')}"`,
        category: "Banned Terms",
        value: foundBanned.length > 0 ? `${foundBanned.length} issues` : "Clean"
      },
      {
        rule: "Secondary Keywords Integration",
        passed: draft.inputs.secondaryKeywords.some(skw => fullText.includes(skw.toLowerCase())),
        message: draft.inputs.secondaryKeywords.some(skw => fullText.includes(skw.toLowerCase()))
          ? `Secondary targeting successful. Found related terms natively integrated.`
          : `None of your secondary keywords are present in the primary draft body yet.`,
        category: "Keywords",
        value: `${draft.inputs.secondaryKeywords.filter(k => fullText.includes(k.toLowerCase())).length} of ${draft.inputs.secondaryKeywords.length}`
      },
      {
        rule: "Flesch Reading Ease Threshold",
        passed: readabilityRulePassed,
        message: readabilityRulePassed
          ? `Highly optimized for ${targetAudienceFriendly}. Ease Score of ${calculatedFRE.toFixed(1)} meets target of ${targetEaseMin}+.`
          : `Reading Ease value is ${calculatedFRE.toFixed(1)} but target is ${targetEaseMin}+ for ${targetAudienceFriendly}. Simplify sentences.`,
        category: "Readability",
        value: `${calculatedFRE.toFixed(1)} Ease`
      },
      {
        rule: "Active Voice Frequency Heuristic",
        passed: activeVoiceHeuristic >= 80,
        message: `High frequency of energetic, human active voice phrases (~${activeVoiceHeuristic}% active).`,
        category: "Readability",
        value: `${activeVoiceHeuristic}%`
      },
      {
        rule: "Structure formatting validation",
        passed: draft.tableOfContents.length >= 2 && draft.sections.length >= 3 && draft.faqs.length === 5,
        message: `Contains full structured flow: TOC, multiple headings (H2 & H3), and exactly 5 FAQs.`,
        category: "Formatting",
        value: `${draft.sections.length} headers`
      }
    ];

    setSeoChecklist(checklist);
  };

  const getFullMarkdownText = (draft: BlogDraft) => {
    let md = `# ${draft.seoTitle}\n\n`;
    md += `*Meta Description: ${draft.metaDescription}*\n`;
    md += `*Slug: ${draft.urlSlug}*\n\n`;
    md += `## Introduction\n\n${draft.introduction}\n\n`;
    
    draft.sections.forEach(sec => {
      const prefix = sec.level === 3 ? "###" : "##";
      md += `${prefix} ${sec.title}\n\n${sec.content}\n\n`;
    });
    
    md += `## Conclusion\n\n${draft.conclusion}\n\n`;
    
    md += `## Frequently Asked Questions\n\n`;
    draft.faqs.forEach(f => {
      md += `### ${f.question}\n\n${f.answer}\n\n`;
    });

    md += `## ${draft.ctaSection.ctaTitle}\n\n${draft.ctaSection.ctaBody}\n\n`;
    md += `---\n\n### Suggested Alt Texts:\n`;
    draft.imageAltTexts.forEach(alt => {
      md += `- ${alt}\n`;
    });

    md += `\n### Internal Linking Targets:\n`;
    draft.internalLinkOpportunities.forEach(link => {
      md += `- ${link}\n`;
    });

    return md;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadAsMarkdown = (draft: BlogDraft) => {
    const text = getFullMarkdownText(draft);
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${draft.urlSlug || "blog-draft"}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine overall EEAT Score Rating based on checklist results
  const passedCount = seoChecklist.filter(c => c.passed).length;
  let eeatLabel = "Evaluating...";
  let eeatColor = "text-amber-400";
  if (seoChecklist.length > 0) {
    const pct = passedCount / seoChecklist.length;
    if (pct >= 0.85) {
      eeatLabel = "A+ Verified";
      eeatColor = "text-emerald-400";
    } else if (pct >= 0.70) {
      eeatLabel = "A Grade";
      eeatColor = "text-emerald-300";
    } else if (pct >= 0.50) {
      eeatLabel = "B Grade (Needs Polish)";
      eeatColor = "text-amber-300";
    } else {
      eeatLabel = "C Grade (Optimize)";
      eeatColor = "text-rose-400";
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-[#d4d4d4] font-sans border border-[#1a1a1a] overflow-hidden">
      {/* HEADER SECTION */}
      <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#080808]" id="app-header">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 to-amber-500 opacity-80 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-neutral-900" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium tracking-widest uppercase text-amber-200/95 font-display">LexiFlow Strategy Studio</h1>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          <span className="text-amber-200/60 hidden sm:inline">Project: Q3 Content</span>
          <span className="hidden sm:inline">Active Code: 22</span>
          <div className="px-3 py-1 border border-neutral-800 rounded-full font-mono text-[10px] text-amber-400">
            Professional SEO Mode
          </div>
        </div>
      </header>
      
      {/* ERROR BANNER */}
      {apiError && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-3 flex items-center justify-between gap-3 text-xs text-rose-300 transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
            <span className="font-sans font-medium hover:text-rose-200 transition-colors">{apiError}</span>
          </div>
          <button 
            type="button"
            onClick={() => setApiError(null)}
            className="text-neutral-400 hover:text-neutral-100 transition-colors font-semibold text-xs px-2.5 py-1 rounded bg-[#101010] border border-neutral-800 hover:bg-neutral-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN CONTAINER FRAME */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* ASIDE NAVIGATION - WORKSPACE CONTROL & LIBRARY */}
        <aside className="w-64 border-r border-[#1a1a1a] bg-[#070707] flex flex-col justify-between" id="app-aside">
          <div className="p-4 space-y-6">
            
            {/* Quick Presets Toggle Panel Selector */}
            <div className="flex items-center gap-1 p-0.5 bg-neutral-900/90 rounded border border-neutral-800">
              <button
                onClick={() => setLeftPanelMode("editor")}
                className={`flex-1 text-center py-1.5 text-xs font-medium rounded transition-all ${
                  leftPanelMode === "editor"
                    ? "bg-[#161616] text-amber-200 border border-neutral-800"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Strategy Input
              </button>
              <button
                onClick={() => setLeftPanelMode("library")}
                className={`flex-1 text-center py-1.5 text-xs font-medium rounded transition-all ${
                  leftPanelMode === "library"
                    ? "bg-[#161616] text-amber-200 border border-neutral-800"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Draft Library ({savedDrafts.length})
              </button>
            </div>

            {/* PRESETS ENGINE */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-wider text-neutral-600 block">Demonstration Presets</span>
              <div className="flex flex-col gap-2">
                {PRESET_TEMPLATES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className="group flex flex-col text-left p-2 rounded bg-[#090909] hover:bg-[#121212] border border-[#161616] hover:border-neutral-800 transition-all text-xs"
                  >
                    <span className="font-semibold text-neutral-400 group-hover:text-amber-200 text-[11px] flex items-center justify-between w-full">
                      {preset.name}
                      <ChevronRight className="w-3 h-3 text-neutral-700 group-hover:text-amber-400" />
                    </span>
                    <span className="text-[10px] text-neutral-600 truncate mt-0.5 max-w-[210px]">
                      {preset.inputs.primaryKeyword}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* STRATEGY WORKSPACE BANTER */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-wider text-neutral-600 block">Human EEAT Guidelines</span>
              <div className="p-3 bg-neutral-900/40 rounded-lg border border-neutral-800/80 text-[11px] leading-relaxed text-neutral-400 space-y-2">
                <p className="italic text-neutral-500">
                  Google rewards genuine real-world experience. Maintain high informational value first, promotional content second.
                </p>
                <div className="h-[1px] bg-neutral-800/50"></div>
                <div className="space-y-1">
                  <span className="text-amber-200/70 text-[10px] font-semibold block uppercase">Forbidden Boilerplate</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-500 rounded">"In conclusion"</span>
                    <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-500 rounded">"Fast-paced world"</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ASIDE FOOTER - CREDIT COUNT TRACKER */}
          <div className="p-4 border-t border-[#1a1a1a] bg-[#090909]">
            <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2 text-neutral-500">
              <span>Strategy Tokens</span>
              <span className="font-mono text-amber-200/80">Unlimited Ready</span>
            </div>
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div className="w-[100%] h-full bg-amber-500/50"></div>
            </div>
          </div>
        </aside>

        {/* DOUBLE COLUMN PANEL SCENARIOS */}
        <section className="flex-1 grid grid-cols-1 xl:grid-cols-2 overflow-hidden">
          
          {/* LEFT COLUMN: PARAMETERS INPUT PANEL OR SAVED LIBRARY */}
          <div className="p-6 overflow-y-auto border-r border-[#1a1a1a] bg-[#0c0c0c]" id="editor-side">
            {leftPanelMode === "editor" ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Content Parameters
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-600">GEO TARGET: {inputs.location || "GLOBAL"}</span>
                </div>

                <div className="space-y-4">
                  
                  {/* Primary Keyword Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Primary Keyword *</label>
                    <input
                      type="text"
                      placeholder="e.g. sustainable coffee roasting"
                      value={inputs.primaryKeyword}
                      onChange={(e) => setInputs({ ...inputs, primaryKeyword: e.target.value })}
                      className="w-full p-2.5 bg-[#141414] border border-neutral-800 rounded text-xs text-amber-50 font-sans focus:outline-none focus:border-amber-500/60 transition-colors"
                      required
                    />
                  </div>

                  {/* Secondary Keywords Input Block (Smart Badge System) */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Secondary Keywords</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type and press add"
                        value={newSecKeyword}
                        onChange={(e) => setNewSecKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSecondaryKeyword();
                          }
                        }}
                        className="flex-1 p-2 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60"
                      />
                      <button
                        type="button"
                        onClick={handleAddSecondaryKeyword}
                        className="px-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors rounded text-xs font-semibold text-amber-200"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {inputs.secondaryKeywords.map((kw, i) => (
                        <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-[10px] rounded border border-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors">
                          {kw}
                          <button type="button" onClick={() => handleRemoveSecondaryKeyword(kw)} className="font-bold hover:text-rose-500 ml-1">
                            &times;
                          </button>
                        </span>
                      ))}
                      {inputs.secondaryKeywords.length === 0 && (
                        <span className="text-[10px] text-neutral-600 italic font-light">No secondary keywords added yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Two Column Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Brand/Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Roast & Bloom"
                        value={inputs.brandName}
                        onChange={(e) => setInputs({ ...inputs, brandName: e.target.value })}
                        className="w-full p-2 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Product / Offer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Eco-Stream Roaster"
                        value={inputs.productName}
                        onChange={(e) => setInputs({ ...inputs, productName: e.target.value })}
                        className="w-full p-2 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>

                  {/* Target Audience & Target Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Target Audience</label>
                      <input
                        type="text"
                        placeholder="e.g. organic food buyers"
                        value={inputs.targetAudience}
                        onChange={(e) => setInputs({ ...inputs, targetAudience: e.target.value })}
                        className="w-full p-2 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Geographic Focus</label>
                      <input
                        type="text"
                        placeholder="e.g. United Kingdom"
                        value={inputs.location}
                        onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
                        className="w-full p-2 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>

                  {/* Search Intent & Word Count */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Search Intent</label>
                      <select
                        value={inputs.searchIntent}
                        onChange={(e) => setInputs({ ...inputs, searchIntent: e.target.value })}
                        className="w-full p-2 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60"
                      >
                        <option value="Informational / Educational">Informational / Educational</option>
                        <option value="Transactional / Commercial Action">Transactional / Commercial Action</option>
                        <option value="Brand Awareness / Context guide">Brand Awareness / Context guide</option>
                        <option value="Technical Manual / In-depth study">Technical Manual / In-depth study</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Target Word Count</label>
                      <select
                        value={inputs.wordCount}
                        onChange={(e) => setInputs({ ...inputs, wordCount: parseInt(e.target.value) || 1000 })}
                        className="w-full p-2 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60"
                      >
                        <option value="600">600 Words (Short Article)</option>
                        <option value="1000">1,000 Words (Standard Post)</option>
                        <option value="1200">1,200 Words (Comprehensive)</option>
                        <option value="1500">1,500 Words (Ultimate Guide)</option>
                      </select>
                    </div>
                  </div>

                  {/* Core Product Information / Context (For strict EEAT authority logic) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Product / Brand Context (For EEAT Infusion)</label>
                    <textarea
                      placeholder="Add real experiences, material details, unique selling propositions to show expertise..."
                      value={inputs.productInformation}
                      onChange={(e) => setInputs({ ...inputs, productInformation: e.target.value })}
                      className="w-full h-20 p-2.5 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60 resize-none font-sans"
                    />
                  </div>

                  {/* Anchor CTA Target Block */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-medium">Designated CTA (Call to Action)</label>
                    <input
                      type="text"
                      placeholder="e.g. Pre-order our Eco-Stream oven online for 10% off"
                      value={inputs.cta}
                      onChange={(e) => setInputs({ ...inputs, cta: e.target.value })}
                      className="w-full p-2 bg-[#141414] border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                </div>

                {/* WRITE / SYNTHESIZE KEYBOARD trigger */}
                <button
                  type="button"
                  onClick={handleGenerateBlog}
                  disabled={generating || !inputs.primaryKeyword}
                  className={`mt-6 w-full py-3.5 rounded-sm font-bold text-xs uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 ${
                    generating
                      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                      : "bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/10 cursor-pointer"
                  }`}
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-neutral-500" />
                      Synthesizing Strategy Engine...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Write Blog Draft
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-[10px] text-neutral-500 leading-normal font-sans">
                  💡 On the Gemini Free Tier limit? You can configure your own <strong>GEMINI_API_KEY</strong> under the <strong>Settings</strong> gear icon (top-right corner of the editor) ➔ <strong>Secrets</strong> panel anytime to bypass shared quotas.
                </p>
              </div>
            ) : (
              /* DRAFT LIBRARY MODE LIST */
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold mb-4 text-left">
                  Saved Content Library
                </h3>
                {savedDrafts.length === 0 ? (
                  <div className="py-12 text-center text-neutral-600 space-y-2">
                    <FileText className="w-8 h-8 mx-auto stroke-[1.5]" />
                    <p className="text-xs italic">No drafts generated yet or standard memory cleared.</p>
                  </div>
                ) : (
                  <div className="space-y-3 font-sans">
                    {savedDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        onClick={() => {
                          setCurrentDraft(draft);
                          setInputs(draft.inputs);
                        }}
                        className={`p-3 rounded border text-left cursor-pointer transition-all ${
                          currentDraft?.id === draft.id
                            ? "bg-[#111111] border-amber-500/40 text-neutral-100"
                            : "bg-[#0c0c0c] border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold block break-words max-w-[190px]">
                            {draft.seoTitle || "Untitled Draft"}
                          </span>
                          <button
                            onClick={(e) => handleDeleteDraft(draft.id, e)}
                            className="text-neutral-600 hover:text-rose-500 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-500">
                          <span>PK: {draft.inputs.primaryKeyword.substring(0, 15)}</span>
                          <span>•</span>
                          <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PREVIEW & ANALYTICS WORKSPACE */}
          <div className="bg-[#030303] flex flex-col p-6 overflow-hidden" id="preview-side">
            
            {/* Nav Tabs for Preview Worksheets */}
            <div className="flex border-b border-neutral-900 pb-3 justify-between items-center">
              <div className="flex gap-2">
                {[
                  { id: "preview", label: "Live Draft" },
                  { id: "seo", label: "SEO Checklist" },
                  { id: "schema", label: "Schema Markup" },
                  { id: "marketing", label: "Marketing Insights" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition-all ${
                      activeTab === tab.id
                        ? "bg-amber-400/10 text-amber-200 border border-amber-500/20"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {currentDraft && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      copyToClipboard(getFullMarkdownText(currentDraft));
                      setIsCopiedAll(true);
                      setTimeout(() => setIsCopiedAll(false), 2000);
                    }}
                    title="Copy post as Markdown"
                    className="p-1 px-2.5 rounded bg-neutral-900 hover:bg-neutral-800 text-[10px] border border-neutral-800 text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-all"
                  >
                    {isCopiedAll ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied Markdown
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Draft
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => downloadAsMarkdown(currentDraft)}
                    title="Download as markdown file"
                    className="p-1 px-2.5 rounded bg-neutral-900 hover:bg-neutral-800 text-[10px] border border-neutral-800 text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    Export .md
                  </button>
                </div>
              )}
            </div>

            {/* PREVIEW CONTAINER WINDOW */}
            <div className="flex-1 mt-4 overflow-y-auto pr-1">
              
              {!currentDraft ? (
                /* EMPTY PLACEHOLDER */
                <div className="h-full flex flex-col justify-center items-center text-center p-8 text-neutral-600">
                  <div className="w-12 h-12 rounded-full border border-neutral-800/80 flex items-center justify-center mb-4 bg-neutral-950">
                    <Sparkles className="w-5 h-5 text-neutral-700 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-medium tracking-wide uppercase text-neutral-400 mb-2 font-display">No Generated Draft Available</h4>
                  <p className="text-xs text-neutral-500 max-w-sm leading-relaxed mb-4">
                    Fill out the parameters or select one of the high-fidelity target presets to synthesize your high-ranking search article instantly.
                  </p>
                  <div className="flex gap-2 font-sans">
                    <button
                      onClick={() => handleApplyPreset(PRESET_TEMPLATES[0])}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] text-amber-200 transition-colors uppercase tracking-wider"
                    >
                      Load Coffee Preset
                    </button>
                    <button
                      onClick={() => handleApplyPreset(PRESET_TEMPLATES[1])}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] text-amber-200 transition-colors uppercase tracking-wider"
                    >
                      Load SaaS Preset
                    </button>
                  </div>
                </div>
              ) : (
                /* ACTIVE CONTENT PRESENTATION TABS */
                <div>
                  
                  {activeTab === "preview" && (
                    <div className="space-y-6 font-serif leading-relaxed text-neutral-300 pb-12">
                      
                      {/* READABILITY HIGHLIGHTER CONTROL BAR */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 px-4 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg gap-3 font-sans">
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="w-8 h-8 rounded bg-amber-400/10 flex items-center justify-center border border-amber-500/20">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-200 block">Readability Highlighter</span>
                            <span className="text-[10px] text-neutral-500 block leading-tight">Interactive sentence scan (underlines & highlights any 25+ word sentences)</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto border-t border-neutral-900 sm:border-0 pt-2.5 sm:pt-0">
                          <span className="text-[10px] text-neutral-400 font-mono">HIGHLIGHT LONG SENTENCES</span>
                          <button
                            onClick={() => setHighlightComplexSentences(!highlightComplexSentences)}
                            className={`px-3 py-1 text-[10px] font-mono rounded tracking-wider uppercase font-semibold transition-all border ${
                              highlightComplexSentences 
                                ? "bg-amber-400/20 text-amber-200 border-amber-500/40" 
                                : "bg-neutral-950 text-neutral-500 border-neutral-900"
                            }`}
                          >
                            {highlightComplexSentences ? "● ENABLED" : "○ DISABLED"}
                          </button>
                        </div>
                      </div>

                      {/* HERO METADATA CARD */}
                      <div className="p-5 bg-neutral-900/40 rounded-lg border border-neutral-800/75 font-sans mb-8 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-widest text-[#d4d4d4]/60 font-semibold">SEO Meta Fields</span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Intent: {currentDraft.inputs.searchIntent.substring(0, 15)}...
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-neutral-500 block">SEO Title ({currentDraft.seoTitle.length} chars)</span>
                          <h4 className="text-sm font-semibold text-amber-100/90 leading-tight">
                            {currentDraft.seoTitle}
                          </h4>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-neutral-500 block">Meta Description ({currentDraft.metaDescription.length} chars)</span>
                          <p className="text-xs text-neutral-400 font-light leading-relaxed">
                            {currentDraft.metaDescription}
                          </p>
                        </div>

                        <div className="flex gap-4 pt-2 text-[11px] text-neutral-400 border-t border-neutral-800/40">
                          <div>
                            <span className="text-neutral-500">URL Slug: </span>
                            <code className="font-mono bg-neutral-950 px-1 py-0.5 text-neutral-400 rounded text-[10px]">
                              /{currentDraft.urlSlug}
                            </code>
                          </div>
                        </div>
                      </div>

                      {/* ARTICLE MAIN TITLE HOOK */}
                      <div className="border-b border-neutral-800/50 pb-4">
                        <span className="text-[10px] uppercase tracking-widest text-amber-400 font-sans font-semibold block mb-2">Introduction</span>
                        <p className="text-[15px] leading-relaxed text-neutral-200">
                          {currentDraft.introduction}
                        </p>
                      </div>

                      {/* NAV TOC PREVIEW DESIGNED BLOCK */}
                      <div className="p-4 bg-neutral-900/20 rounded-lg border border-neutral-800/50 font-sans">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block mb-2">In this article: (Table of Contents)</span>
                        <ul className="space-y-1.5 text-xs">
                          {currentDraft.tableOfContents.map((item, id) => (
                            <li key={id} className="flex items-center gap-1 text-amber-200/60 hover:text-amber-200 font-light">
                              <span className="text-[9px] text-neutral-600 font-mono">0{id + 1}.</span>
                              <a href={`#${item.anchor}`} className="hover:underline text-neutral-400 hover:text-amber-300">
                                {item.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CORE PARAGRAPHS - SECTIONS GRID WITH INTEGRATED TWEAK CONTROL */}
                      <div className="space-y-8 mt-8">
                        {currentDraft.sections.map((sec, index) => {
                          const sectionSentences = sec.content.split(/[.!?]+(?:\s+|$)/).filter(Boolean);
                          const complexCount = sectionSentences.filter(s => s.trim().split(/\s+/).filter(Boolean).length >= 25).length;

                          return (
                            <div key={index} id={sec.anchor} className="group relative border-l-2 border-neutral-800 hover:border-amber-500/30 pl-4 transition-all">
                              
                              {/* Heading block selection info */}
                              <div className="flex items-center justify-between mb-2 font-sans">
                                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                  Section {index + 1} &bull; H{sec.level}
                                </span>
                                
                                {/* Direct action to optimization section */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setTweakingSectionIndex(index);
                                      setTweakInstructions("");
                                    }}
                                    className="bg-[#0f0f0f] border border-neutral-800 hover:bg-neutral-800 px-2.5 py-1 rounded text-[10px] text-neutral-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Edit className="w-2.5 h-2.5" />
                                    Tweak Section
                                  </button>

                                  <button
                                    onClick={() => handleAutoSimplifySection(index)}
                                    disabled={simplifyingIndex === index}
                                    className={`bg-amber-400/10 border border-amber-500/20 hover:bg-amber-500/20 px-2.5 py-1 rounded text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors ${
                                      simplifyingIndex === index ? "opacity-60 cursor-not-allowed" : ""
                                    }`}
                                    title="AI scan to rewrite and break down hard-to-read sentences beautifully."
                                  >
                                    {simplifyingIndex === index ? (
                                      <>
                                        <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
                                        Simplifying...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-2.5 h-2.5" />
                                        Auto-Simplify
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Heading markup representation styling based on levels */}
                              {sec.level === 3 ? (
                                <h4 className="text-base text-neutral-200 font-bold tracking-tight mb-3">
                                  {sec.title}
                                </h4>
                              ) : (
                                <h3 className="text-[17px] text-amber-100 font-medium tracking-normal mb-3">
                                  {sec.title}
                                </h3>
                              )}

                              {/* Complexity warning banner for the section */}
                              {highlightComplexSentences && complexCount > 0 && (
                                <div className="mt-1 mb-3.5 p-2 px-3 bg-amber-500/5 rounded border border-amber-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                    <span className="text-[11px] text-amber-200/95 leading-tight text-left">
                                      This section contains <strong>{complexCount}</strong> wordy sentence{complexCount > 1 ? "s" : ""} exceeding readability limits (25+ words).
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleAutoSimplifySection(index)}
                                    disabled={simplifyingIndex === index}
                                    className={`text-[10px] font-bold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1 rounded flex items-center gap-1 transition-all flex-shrink-0 self-start sm:self-auto ${
                                      simplifyingIndex === index ? "opacity-60 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {simplifyingIndex === index ? (
                                      <>
                                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                        Simplifying...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-2.5 h-2.5" />
                                        Auto-Simplify Section
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* Inline Body content split into natural paragraphs with highlighter */}
                              <div className="space-y-4">
                                {sec.content.split("\n\n").map((para, pi) => (
                                  <p key={pi} className="text-[14px] leading-relaxed font-serif text-neutral-300">
                                    {renderParagraphText(para, highlightComplexSentences)}
                                  </p>
                                ))}
                              </div>

                            {/* SECTION OPTIMIZATION INLINE POPUP */}
                            {tweakingSectionIndex === index && (
                              <div className="mt-4 p-4 bg-[#0a0a0a] rounded-lg border border-amber-500/30 font-sans space-y-3 z-10 relative">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase text-amber-300 font-semibold">Tweak Section #{index + 1} with AI Strategic Instruct</span>
                                  <button onClick={() => setTweakingSectionIndex(null)} className="text-neutral-500 hover:text-neutral-300 font-bold">
                                    &times;
                                  </button>
                                </div>
                                <textarea
                                  placeholder="e.g., Make this part sound more authoritative, include a concrete stat, or make sentence lengths shorter..."
                                  value={tweakInstructions}
                                  onChange={(e) => setTweakInstructions(e.target.value)}
                                  className="w-full text-xs p-2 bg-[#141414] border border-neutral-800 focus:border-amber-400 rounded text-neutral-300 h-16 resize-none focus:outline-none"
                                />
                                <div className="flex justify-end gap-2 text-xs">
                                  <button
                                    onClick={() => setTweakingSectionIndex(null)}
                                    className="px-2.5 py-1 text-[10px] text-neutral-400 hover:text-neutral-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleTweakSection}
                                    disabled={isTweaking || !tweakInstructions.trim()}
                                    className={`px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-bold uppercase tracking-wider rounded ${
                                      isTweaking ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {isTweaking ? "Optimizing..." : "Apply Adjustments"}
                                  </button>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                      {/* ARTICLE CONCLUSION BLOCK */}
                      <div className="mt-12 pt-6 border-t border-neutral-800/60">
                        <span className="text-[10px] uppercase tracking-widest text-[#d4d4d4]/60 font-sans font-semibold block mb-2 font-display">Refined Insights</span>
                        <p className="text-[14px] font-serif leading-relaxed text-neutral-300">
                          {currentDraft.conclusion}
                        </p>
                      </div>

                      {/* FAQ SECTION */}
                      <div className="mt-12 p-5 bg-neutral-900/20 rounded-xl border border-neutral-800/80 font-sans space-y-4">
                        <h4 className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold mb-2">
                          Frequently Asked Questions (Fulfill Intent)
                        </h4>
                        <div className="space-y-4">
                          {currentDraft.faqs.map((faq, fidx) => (
                            <div key={fidx} className="space-y-1 text-xs">
                              <span className="font-semibold text-amber-200/80 block select-text">
                                Q: {faq.question}
                              </span>
                              <span className="text-neutral-400 font-light leading-relaxed block pl-3 border-l border-neutral-800 select-text">
                                {faq.answer}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DESIGNATED MARKETING CTA PANEL */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-amber-900/10 border border-amber-500/20 rounded-lg font-sans">
                        <h4 className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-2 font-display">
                          {currentDraft.ctaSection.ctaTitle}
                        </h4>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {currentDraft.ctaSection.ctaBody}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* ACTIVE TAB: REAL TIME METRIC ANALYSIS REPORT */}
                  {activeTab === "seo" && (
                    <div className="space-y-6 font-sans">
                      
                      {/* BENTO STATS BREAKDOWN GRID */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 bg-[#0a0a0a] border border-neutral-800 rounded">
                          <span className="text-[10px] uppercase text-neutral-500 block">Total Word Count</span>
                          <span className="text-base font-bold text-neutral-100 font-mono mt-1 block">
                            {customWordCount}
                          </span>
                          <span className="text-[9px] text-neutral-600 block">target: {currentDraft.inputs.wordCount}</span>
                        </div>
                        <div className="p-3 bg-[#0a0a0a] border border-neutral-800 rounded">
                          <span className="text-[10px] uppercase text-neutral-500 block">Keyword Density</span>
                          <span className="text-base font-bold text-neutral-100 font-mono mt-1 block">
                            {customDensity.toFixed(2)}%
                          </span>
                          <span className="text-[9px] text-neutral-600 block">suggested: 0.8% - 1.5%</span>
                        </div>
                        <div className="p-3 bg-[#0a0a0a] border border-neutral-800 rounded">
                          <span className="text-[10px] uppercase text-neutral-500 block font-sans">Active Voice Est</span>
                          <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                            {activeVoicePct}%
                          </span>
                          <span className="text-[9px] text-neutral-600 block">suggested: &gt; 80%</span>
                        </div>
                        <div className="p-3 bg-[#0a0a0a] border border-neutral-800 rounded">
                          <span className="text-[10px] uppercase text-neutral-500 block">EEAT Status Rating</span>
                          <span className={`text-xs font-bold font-mono mt-1.5 block ${eeatColor}`}>
                            {eeatLabel}
                          </span>
                        </div>
                      </div>

                      {/* FLESCH-KINCAID READABILITY ANALYSIS DASHBOARD */}
                      <div className="p-4 bg-[#0a0a0a]/80 rounded border border-neutral-800/80 space-y-4 text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h4 className="text-xs uppercase tracking-widest text-amber-200 font-bold flex items-center gap-1.5 font-sans">
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            Flesch-Kincaid Readability Analysis
                          </h4>
                          <span className="text-[9px] uppercase tracking-wider bg-neutral-900 text-neutral-400 border border-neutral-800 px-2.5 py-1 rounded-sm w-fit font-mono">
                            Target: {currentDraft.inputs.targetAudience || "General Public"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Flesch Reading Ease Metric Card */}
                          <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded space-y-2.5">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] uppercase text-neutral-400 font-sans font-medium">Flesch Reading Ease</span>
                              <span className="text-lg font-extrabold text-amber-200 font-mono">
                                {fleschReadingEase.toFixed(1)}<span className="text-[10px] text-neutral-500 font-light">/100</span>
                              </span>
                            </div>
                            
                            {/* Colorful Ease Gauge Slider Track */}
                            <div className="w-full bg-neutral-900 h-2 rounded overflow-hidden relative border border-neutral-800">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded transition-all duration-500"
                                style={{ width: `${fleschReadingEase}%` }}
                              />
                            </div>

                            <div className="flex justify-between text-[8px] text-neutral-500 font-mono">
                              <span>0 (Dense)</span>
                              <span>60 (Standard)</span>
                              <span>100 (Easy)</span>
                            </div>

                            <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                              Explanation: <strong className="text-amber-200">{getReadingEaseExplanation(fleschReadingEase)}</strong>.
                            </p>
                          </div>

                          {/* Flesch-Kincaid Grade Level Metric Card */}
                          <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded space-y-2.5">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] uppercase text-neutral-400 font-sans font-medium">Kincaid Grade Level</span>
                              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                                Grade {fleschKincaidGrade.toFixed(1)}
                              </span>
                            </div>

                            {/* Color Bar Slider based on Grade level */}
                            <div className="w-full bg-neutral-900 h-2 rounded overflow-hidden relative border border-neutral-800">
                              <div 
                                className="h-full bg-emerald-400 transition-all duration-500 rounded"
                                style={{ 
                                  width: `${Math.min(100, (fleschKincaidGrade / 16) * 100)}%`,
                                  backgroundColor: fleschKincaidGrade <= 8.5 ? "#34d399" : fleschKincaidGrade <= 12.5 ? "#fbbf24" : "#f87171"
                                }}
                              />
                            </div>

                            <div className="flex justify-between text-[8px] text-neutral-500 font-mono">
                              <span>Grade 5.0 (Basic)</span>
                              <span>Grade 9.0 (Standard)</span>
                              <span>Grade 16.0 (Grad)</span>
                            </div>

                            <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                              Rating: <strong className="text-emerald-300">{getGradeLevelExplanation(fleschKincaidGrade).title}</strong>. {getGradeLevelExplanation(fleschKincaidGrade).description}
                            </p>
                          </div>
                        </div>

                        {/* Audience Fit Analysis Panel */}
                        {(() => {
                          const targetAud = (currentDraft.inputs.targetAudience || "").toLowerCase();
                          let targetEaseMin = 55;
                          let targetAudienceFriendly = "Standard Reader";

                          if (targetAud.includes("expert") || targetAud.includes("pro") || targetAud.includes("developer") || targetAud.includes("engineer") || targetAud.includes("academic") || targetAud.includes("scientific")) {
                            targetEaseMin = 35;
                            targetAudienceFriendly = "Technical Specialists";
                          } else if (targetAud.includes("beginner") || targetAud.includes("child") || targetAud.includes("elementary") || targetAud.includes("simple") || targetAud.includes("easy") || targetAud.includes("novel")) {
                            targetEaseMin = 70;
                            targetAudienceFriendly = "Beginners or Students";
                          }

                          const activeReadabilityRulePassed = fleschReadingEase >= targetEaseMin;

                          return (
                            <div className="p-3.5 bg-neutral-950 rounded border border-neutral-900">
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${activeReadabilityRulePassed ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
                                <span className="text-[11.5px] font-semibold text-neutral-200">
                                  Audience Accessibility Met: {activeReadabilityRulePassed ? (
                                    <span className="text-emerald-400 font-bold">Optimal Match</span>
                                  ) : (
                                    <span className="text-amber-400 font-bold font-sans">Requires Simplification</span>
                                  )}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 leading-relaxed mt-2">
                                {activeReadabilityRulePassed 
                                  ? `Your content achieves a ${fleschReadingEase.toFixed(1)} reading ease, satisfying target accessibility parameters (${targetEaseMin}+ Ease Score) suited to your audience: "${currentDraft.inputs.targetAudience}".`
                                  : `This article requires a Grade ${fleschKincaidGrade.toFixed(1)} readability level (${fleschReadingEase.toFixed(1)} Ease score) but your target audience (${currentDraft.inputs.targetAudience}) expects simpler language (~${targetEaseMin}+). We recommend reducing sentence complexity.`}
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* DETAILED CHECKLIST RESULTS */}
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase tracking-widest text-[#d4d4d4]/60 font-semibold mb-3">
                          Strategic Validation Rules Check
                        </h4>
                        
                        <div className="space-y-2">
                          {seoChecklist.map((chk, cidx) => (
                            <div key={cidx} className="flex items-start justify-between gap-4 p-3 rounded bg-[#0a0a0a]/50 border border-neutral-900 text-xs text-left">
                              <div className="flex gap-2.5 items-start">
                                {chk.passed ? (
                                  <CheckSquareIcon className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                )}
                                <div>
                                  <span className="font-semibold block text-neutral-200">
                                    {chk.rule}
                                  </span>
                                  <span className="text-[11px] text-neutral-400 leading-relaxed block mt-0.5">
                                    {chk.message}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] bg-[#141414] text-neutral-400 px-2 py-0.5 rounded uppercase block font-mono">
                                  {chk.category}
                                </span>
                                {chk.value && (
                                  <span className="text-[10px] text-amber-200 font-mono block mt-1">
                                    {chk.value}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ACTIVE TAB: SCHEMA MARKUP OPPORTUNITY */}
                  {activeTab === "schema" && (
                    <div className="space-y-4 font-sans text-xs text-left">
                      <div className="p-4 bg-neutral-900/40 rounded border border-neutral-800">
                        <h4 className="text-xs uppercase tracking-widest text-amber-200 font-semibold mb-2">
                          Structured JSON-LD Schema (Google Snippet Optimized)
                        </h4>
                        <p className="text-neutral-400 text-[11px] mb-3 leading-relaxed">
                          Apply this structured metadata Schema directly into the head section of your published blogging CMS to trigger prime rich results spots in Google.
                        </p>
                        
                        <pre className="p-3 bg-[#0d0d0d] font-mono text-[10px] text-amber-100/90 rounded border border-neutral-900 overflow-x-auto leading-relaxed">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": currentDraft.schemaMarkupType || "BlogPosting",
  "headline": currentDraft.seoTitle,
  "description": currentDraft.metaDescription,
  "url": `https://example.com/blog/${currentDraft.urlSlug}`,
  "author": {
    "@type": "Person",
    "name": "Expert Strategist"
  },
  "publisher": {
    "@type": "Organization",
    "name": currentDraft.inputs.brandName || "Company"
  }
}, null, 2)}
                        </pre>
                      </div>

                      <div className="p-4 bg-neutral-900/20 rounded border border-neutral-800 space-y-2">
                        <h5 className="font-semibold text-neutral-200 text-xs">Schema Strategy Checklist</h5>
                        <ul className="space-y-1 text-neutral-400 text-[11px]">
                          <li>&bull; schemaMarkupType generated satisfies: <b>{currentDraft.schemaMarkupType}</b></li>
                          <li>&bull; Aligns with strict schema validation guidelines.</li>
                          <li>&bull; Suitable for Google Rich Results card preview.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE TAB: INTUITIVE MARKETING / INTERNAL LINKS OPPORTUNITIES */}
                  {activeTab === "marketing" && (
                    <div className="space-y-5 font-sans text-xs text-left">
                      
                      <div className="p-4 bg-neutral-900/40 rounded border border-neutral-800 space-y-3">
                        <h4 className="text-xs uppercase tracking-widest text-amber-300 font-semibold flex items-center gap-1.5">
                          <Link className="w-3.5 h-3.5" />
                          Suggested Internal Link Anchor Opportunities
                        </h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Google uses internal linking anchor terms to map local page hierarchy relations. Seek these terms inside your broader article catalog directory and redirect readers here:
                        </p>
                        <div className="flex flex-col gap-2 mt-2">
                          {currentDraft.internalLinkOpportunities.map((link, idx) => (
                            <div key={idx} className="p-2.5 bg-neutral-950 rounded border border-neutral-900/80 font-mono text-[11px] text-neutral-300 leading-normal">
                              {link}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-900/40 rounded border border-neutral-800 space-y-3">
                        <h4 className="text-xs uppercase tracking-widest text-amber-300 font-semibold flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Suggested Image Alt Texts (For Google Image Search SEO)
                        </h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Use these descriptive and semantic keyword-balanced alt text variations when matching header images or explanatory diagrams to your article:
                        </p>
                        <ul className="space-y-2">
                          {currentDraft.imageAltTexts.map((alt, idx) => (
                            <li key={idx} className="flex gap-2 p-2 bg-[#090909] rounded border border-neutral-900 leading-normal text-[11px] text-neutral-400">
                              <span className="font-semibold text-amber-200">Alt {idx+1}:</span>
                              <span>{alt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  )}

                </div>
              )}
            </div>

          </div>

        </section>
      </main>

      {/* FOOTER METADATAS AND REAL-TIME HEALTH VERIFICATION BAR */}
      <footer className="h-10 bg-[#050505] border-t border-[#1a1a1a] flex items-center px-6 justify-between text-[10px] uppercase tracking-widest text-neutral-500 font-mono" id="app-footer">
        <div>
          EEAT Score: <span className={`${currentDraft ? eeatColor : "text-neutral-600"}`}>{currentDraft ? eeatLabel : "N/A"}</span>
        </div>
        <div className="flex gap-4 sm:gap-8 overflow-hidden text-[9px] sm:text-[10px]">
          <span>PK Density: {currentDraft ? `${customDensity.toFixed(1)}%` : "N/A"}</span>
          <span className="hidden sm:inline font-sans">Words: {currentDraft ? customWordCount : "N/A"}</span>
          <span>Voice: {currentDraft ? `${activeVoicePct}%` : "N/A"}</span>
          <span className="hidden md:inline">Schema: {currentDraft ? currentDraft.schemaMarkupType : "N/A"}</span>
        </div>
      </footer>
    </div>
  );
}

// Inline checklist iconography helper to avoid extra package loadings
function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"/>
      <path d="m9 11 3 3L22 4"/>
    </svg>
  );
}

function getReadingEaseExplanation(score: number): string {
  if (score >= 90) return "Very Easy to read";
  if (score >= 80) return "Easy to read";
  if (score >= 70) return "Fairly Easy to read";
  if (score >= 60) return "Standard Plain English";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult to read";
  return "Very Difficult / Academic";
}

function getGradeLevelExplanation(grade: number): { title: string; description: string } {
  if (grade <= 5.5) return { title: "5th Grade & Below", description: "Readable by an average 10-11 year old." };
  if (grade <= 6.5) return { title: "6th Grade", description: "Conversational, easy-flowing content structures." };
  if (grade <= 7.5) return { title: "7th Grade", description: "Fairly straightforward plain language text." };
  if (grade <= 9.5) return { title: "8th to 9th Grade", description: "Standard public blogs or newspaper level." };
  if (grade <= 12.5) return { title: "10th to 12th Grade", description: "Highly educational, requires focused attention." };
  if (grade <= 16.5) return { title: "College level reader", description: "Contains sophisticated terminology or academic structures." };
  return { title: "Post-Graduate / Professional", description: "Advanced academic research tier terminology." };
}

function renderParagraphText(text: string, highlight: boolean): React.ReactNode {
  if (!highlight) {
    return <span>{text}</span>;
  }
  
  // Splits text by looking for sentences with trailing punctuation and spacing, or line endings
  const sentenceRegex = /([^.!?]+[.!?]+(?:\s+|$)|[^.!?]+)/g;
  const matches = text.match(sentenceRegex);
  if (!matches || matches.length === 0) {
    return <span>{text}</span>;
  }
  
  return (
    <>
      {matches.map((sentence, idx) => {
        const trimmed = sentence.trim();
        if (!trimmed) {
          return <span key={idx}>{sentence}</span>;
        }
        
        // Count words accurately
        const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
        
        if (wordCount >= 25) {
          return (
            <span 
              key={idx}
              className="bg-amber-500/10 border-b border-dashed border-amber-500/50 rounded-sm px-0.5 hover:bg-amber-500/20 cursor-help transition-all relative group/sentence inline"
              title={`This sentence has ${wordCount} words. Click "Auto-Simplify" in this section to shorten it.`}
            >
              {sentence}
              <span className="pointer-events-none opacity-0 group-hover/sentence:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-[10px] text-amber-200 font-mono font-medium rounded shadow-xl whitespace-nowrap z-50">
                ⚠️ {wordCount} words (Complex Sentence)
              </span>
            </span>
          );
        }
        
        return <span key={idx}>{sentence}</span>;
      })}
    </>
  );
}

