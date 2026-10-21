export type ProjectStage = {
  label: string;
  note?: string;
};

export type Project = {
  slug: string;
  index: string; // "01", "02"...
  title: string;
  year: string;
  tagline: string;
  stack: string[];
  summary: string;
  stages: ProjectStage[];
  idea: string;
  system: string[];
  process: string[];
  result: string;
  handLabel: string; // small handwritten-style annotation
};

export const projects: Project[] = [
  {
    slug: "paperforge",
    index: "01",
    title: "PaperForge AI",
    year: "2026",
    tagline: "RESEARCH → RETRIEVAL → CODE",
    stack: ["Python", "RAG", "LLMs", "Vector DB", "FAISS"],
    summary:
      "An end-to-end RAG pipeline that reads academic research papers and turns their methodology sections into working Python.",
    stages: [
      { label: "RESEARCH PAPER" },
      { label: "DOCUMENT PROCESSING" },
      { label: "SEMANTIC CHUNKING", note: "recursive character splitting" },
      { label: "VECTOR SEARCH", note: "FAISS" },
      { label: "LLM" },
      { label: "METHODOLOGY" },
      { label: "PYTHON CODE" },
    ],
    idea: "Academic papers describe methods in prose and formulas that stay locked on the page. PaperForge AI reads a paper the way a researcher would — retrieve the relevant section, understand the method, then re-express it as code you can actually run.",
    system: [
      "Documents are split with semantic chunking and recursive character splitting, tuned so a chunk stays a coherent unit of meaning rather than an arbitrary slice of text.",
      "Chunks are embedded and indexed in a FAISS vector store for fast semantic retrieval.",
      "A research-to-code parser takes the retrieved methodology and converts unstructured formulas into compilable Python functions, guided by strict prompts and output schemas.",
    ],
    process: [
      "Retrieval quality was evaluated with Recall@K to keep the pipeline honest about what it actually finds.",
      "Prompt and schema design went through several passes to keep LLM output strictly structured — code that compiles, not code that merely reads well.",
    ],
    result:
      "A working pipeline: paper in, retrieved methodology and runnable Python out — built as a personal exploration of RAG systems applied to a genuinely hard retrieval problem.",
    handLabel: "papers → code",
  },
  {
    slug: "url-shortener",
    index: "02",
    title: "URL Shortener",
    year: "2026",
    tagline: "URL → HASH → DATABASE → REDIRECT",
    stack: ["Python", "Django", "Docker", "Bootstrap", "GitHub Actions"],
    summary:
      "A small, properly engineered technical artifact — a URL shortener built with a real CI/CD pipeline, not just a script.",
    stages: [
      { label: "URL" },
      { label: "HASH" },
      { label: "DATABASE" },
      { label: "REDIRECT" },
    ],
    idea: "Some projects exist to explore an idea. This one exists to practice getting the fundamentals right — a clean Django backend, a containerized environment, and an automated pipeline from commit to deploy-ready build.",
    system: [
      "Django handles routing, hashing, and persistence; incoming long URLs are hashed into short keys and stored for lookup.",
      "Bootstrap keeps the interface simple and out of the way.",
      "The whole thing runs in Docker for a consistent environment from laptop to server.",
    ],
    process: [
      "GitHub Actions runs the CI pipeline on every push — build, test, and containerize automatically.",
    ],
    result:
      "A compact, well-structured full-stack artifact: URL in, short hash out, reliable redirect back — with the CI/CD discipline of a much larger system.",
    handLabel: "shrink & redirect",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
