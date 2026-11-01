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
    slug: "covenant",
    index: "01",
    title: "Covenant",
    year: "2026",
    tagline: "PLAIN ENGLISH → RULES → CHECKS → ENFORCED",
    stack: ["Python", "Claude Code hooks", "MCP", "Git hooks", "GitHub Actions", "Docker"],
    summary:
      "Rules for coding agents that actually hold: write them in plain English — \"don't change public APIs, run tests before committing\" — and Covenant turns them into checks enforced live, in git, and in CI.",
    stages: [
      { label: "PLAIN-ENGLISH RULES" },
      { label: "COMPILE", note: "grounded in the repo → covenant.yaml" },
      { label: "AGENT WORKS", note: "Claude Code · Cursor · Codex · any MCP client" },
      { label: "CHECK OUTCOMES", note: "API surface · protected files · order of events" },
      { label: "BLOCK + EXPLAIN", note: "rule · evidence · fix" },
    ],
    idea: "You tell an agent \"don't change public APIs, don't delete user data, run tests before committing.\" It usually listens. Covenant makes sure it does — by checking outcomes rather than tool calls: the API surface after the edits, what happened to protected files however they were touched, and whether the tests passed after the last edit and before the commit.",
    system: [
      "Its compiler reads plain-English rules, grounds them in the repo, and binds each one to a checker in covenant.yaml.",
      "Checkers cover public APIs in Python, TypeScript, Go, Rust and Java; protected files and SQLite rows (restored from a snapshot if lost); destructive migrations; dependency changes; folder scope; secrets and skipped tests; change size; and the order and count of the agent's steps.",
      "Risky commands — force pushes, deploys, destructive SQL and more, 16 categories — are refused before they run, with a network allowlist and time, action and cost budgets.",
      "Enforced through Claude Code hooks, an MCP server for Cursor, Codex and others, git pre-commit and pre-push hooks, a GitHub Action that judges each PR by its base commit's rules, a VS Code panel, and a Docker sandbox.",
      "When a rule is broken, the agent gets the rule, the evidence and a fix; its explain command tells the story, and its undo command restores the working tree from a restore point.",
    ],
    process: [
      "Benchmarked on CovenantBench, plus live trials with Claude Code on four real open-source repos (TinyDB, itsdangerous, humanize, prettytable) — each with an honest task and a trap task.",
      "Published on PyPI as covenant-agents, with tests in CI, on Windows, macOS and Linux.",
    ],
    result:
      "Violations per task fell from 1.17 to 0 on CovenantBench with task success unchanged at 100%. On the four real repos every honest task committed and every trap was refused or blocked — at about 0.2 seconds per agent action.",
    handLabel: "rules that hold",
    links: {
      repo: "https://github.com/visweshdev/Covenant",
    },
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
