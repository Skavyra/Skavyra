// TEMP mock data, replace with Supabase query when DB columns exist
import type { FlagshipCourse } from "@/types/flagship";

const offerEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

export const FLAGSHIP_COURSES: FlagshipCourse[] = [
  {
    id: "flagship-ai-si-practitioner",
    slug: "ai-si-practitioner",
    title: "AI/SI Practitioner",
    subtitle: "Build and enhance autonomous agentic bots",
    description:
      "Go end to end with LLMs, SLMs, models, fine-tuning, and building and enhancing an autonomous agentic bot.",
    category: "it",
    level: "advanced",
    cover_image_url: null,
    price: 25000,
    mrp: 40000,
    duration_weeks: 16,
    mentor_name: "Mentor name",
    mentor_company: null,
    learning_outcomes:
      "Understand LLM and SLM architectures\nEvaluate and select models for practical use\nFine-tune models for targeted tasks\nBuild and enhance an autonomous agentic bot",
    sort_order: 1,
    is_flagship: true,
    offer_label: "Launch offer",
    offer_ends_at: offerEndsAt,
    tools: ["Python", "OpenAI", "Hugging Face", "LangChain", "Vector databases"],
  },
  {
    id: "flagship-ai-product-manager",
    slug: "ai-product-manager",
    title: "AI Product Manager",
    subtitle: "Turn business opportunities into AI products",
    description:
      "Learn incubation and automation in business through real cases and problems, then shape curated solutions with measurable value.",
    category: "both",
    level: "intermediate",
    cover_image_url: null,
    price: 25000,
    mrp: 40000,
    duration_weeks: 16,
    mentor_name: "Mentor name",
    mentor_company: null,
    learning_outcomes:
      "Identify opportunities for business incubation\nMap real business problems to AI use cases\nDesign automation workflows with stakeholders\nCurate and prioritize practical product solutions",
    sort_order: 2,
    is_flagship: true,
    offer_label: "Launch offer",
    offer_ends_at: offerEndsAt,
    tools: ["Jira", "Miro", "ChatGPT", "Notion", "Product analytics"],
  },
  {
    id: "flagship-business-marketing-growth",
    slug: "business-marketing-growth",
    title: "Business Marketing & Growth",
    subtitle: "Grow smarter with marketing, automation, and AI",
    description:
      "Use marketing tools, automation, AI infusion, and analytics to build and improve a practical growth strategy.",
    category: "non_it",
    level: "intermediate",
    cover_image_url: null,
    price: 25000,
    mrp: 40000,
    duration_weeks: 16,
    mentor_name: "Mentor name",
    mentor_company: null,
    learning_outcomes:
      "Select marketing tools for growth goals\nAutomate repeatable marketing workflows\nInfuse AI into content and campaign planning\nUse analytics to measure and improve performance",
    sort_order: 3,
    is_flagship: true,
    offer_label: "Launch offer",
    offer_ends_at: offerEndsAt,
    tools: ["Google Analytics", "HubSpot", "Canva", "Mailchimp", "ChatGPT"],
  },
];
