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
  // "in-development" shows an IN DEVELOPMENT badge and leaves the project
  // out of the "projects shipped" count. Omit for finished projects.
  status?: "in-development";
  // false keeps a project off the homepage's Selected Projects; it still
  // shows on /projects (VIEW ALL PROJECTS). Omit to feature it.
  featured?: false;
  // Public source / live deployment. Either can be left out — only the
  // links that exist are rendered.
  links?: {
    repo?: string;
    demo?: string;
  };
};

export const projects: Project[] = [
  {
    slug: "recoverrl",
    index: "01",
    title: "RecoverRL",
    year: "2026",
    tagline: "FAILURE → FEATURES → LEARNED POLICY → VERIFY",
    stack: ["Python", "Google ADK", "Gemini", "scikit-learn", "Contextual bandits"],
    status: "in-development",
    summary:
      "Agents that learn how to recover: when a tool call or multi-step workflow fails, a learned policy picks the right recovery strategy instead of blindly retrying.",
    stages: [
      { label: "TOOL CALL FAILS" },
      { label: "FAILURE FEATURES", note: "error, history, environment state" },
      { label: "LEARNED POLICY", note: "retry · inspect · refresh schema · replan · escalate" },
      { label: "VERIFY COMPLETION" },
    ],
    idea: "A typical agent handles failure the same way every time — retry the API call, ask the LLM to reflect, or restart the whole task. RecoverRL learns to choose the right response from the failure itself, the execution history, and the current state of the environment.",
    system: [
      "When a tool call fails, features are extracted from the error, the execution trace so far, and the environment state.",
      "A learned recovery policy — supervised learning or a contextual bandit trained on execution traces — selects one action: retry, inspect state, refresh the schema, replan, or escalate.",
      "Task completion is then verified, so a recovery only counts if the task actually finishes.",
    ],
    process: [
      "Built on the existing AgentGauntlet benchmark rather than a new failure-testing framework — the contribution is the learned policy and its results.",
      "The policy is compared against fixed retries, rule-based recovery, and LLM self-reflection.",
      "Evaluation tracks task recovery rate, cost per successful recovery, duplicate side effects, and performance on unfamiliar tools and task types.",
    ],
    result:
      "In development — the recovery policy and its comparison against baseline strategies are being built and evaluated now.",
    handLabel: "fail → learn → recover",
  },
  {
    slug: "remem",
    index: "02",
    title: "ReMem",
    year: "2026",
    tagline: "ADD → SEARCH → ACT → FEEDBACK → LEARN",
    stack: ["Python", "MCP", "LangChain", "sentence-transformers", "FAISS", "Chroma"],
    summary:
      "Memory for AI agents that learns from outcomes which memories actually help — it retires outdated facts, demotes useless look-alikes, and fits a token budget.",
    stages: [
      { label: "ADD FACTS" },
      { label: "SEARCH", note: "similarity × learned usefulness" },
      { label: "AGENT ACTS" },
      { label: "FEEDBACK", note: "did it work · which memories helped" },
      { label: "MEMORY LEDGER", note: "rank · retire · demote" },
    ],
    idea: "Most agent memories return whatever sounds most similar to the question. That breaks in two everyday ways: a look-alike note that never helps keeps winning, and a fact replaced last week is served right next to its replacement. ReMem ranks memories by what actually helped, not just by what sounds close.",
    system: [
      "Three calls: add facts, search before answering, and report feedback after — whether the task worked and which memories were used.",
      "Ranking combines similarity with usefulness learned from outcomes; context is picked by an expected-utility knapsack under a token budget instead of a fixed top-k.",
      "Every memory moves through an explicit lifecycle — active, low-value, compressed, archived, invalidated — with each transition logged. Nothing is deleted, replaced facts stay queryable \"as of\" a past date, and every decision can be inspected.",
      "Ships as a Python API, an MCP server (so Claude and other MCP clients can use it as long-term memory) and a LangChain retriever, with pluggable embedders and FAISS/Chroma backends. Runs fully locally.",
    ],
    process: [
      "Benchmarked against plain similarity search on 7 synthetic task families across 15 held-out seeds never used for tuning.",
      "Also tested with real embeddings, a timestamp-aware reader, a small local LLM as the agent, and the public LongMemEval benchmark.",
      "Results are reported honestly, including the settings where it doesn't help.",
    ],
    result:
      "+10 to +14 points of task success over similarity search in the controlled benchmark (also with real embeddings), with the biggest gains where facts change. With a small real LLM the gain is within noise, and on LongMemEval, where no question repeats, it behaves like plain search — a research prototype, documented as one.",
    handLabel: "remembers what helps",
    links: {
      repo: "https://github.com/visweshdev/ReMem",
    },
  },
  {
    slug: "paperforge",
    index: "03",
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
    index: "04",
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
    featured: false,
    links: {
      repo: "https://github.com/visweshdev/url-shortener",
    },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
