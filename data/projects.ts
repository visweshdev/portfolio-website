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
    slug: "relayqueue",
    index: "03",
    title: "RelayQueue",
    year: "2026",
    tagline: "SUBMIT → QUEUE → EXECUTE → TRACK",
    stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Prometheus"],
    summary:
      "A distributed job queue that runs work in the background, retries failures, and lets you follow every attempt in a live dashboard.",
    stages: [
      { label: "SUBMIT", note: "FastAPI" },
      { label: "PERSIST", note: "PostgreSQL stores the job" },
      { label: "LEASE", note: "Redis coordinates workers" },
      { label: "EXECUTE", note: "retry after a failure or expired lease" },
      { label: "INSPECT", note: "dashboard · attempts · results" },
    ],
    idea: "A request to generate a report should return quickly, and the work should survive a worker crash. I built RelayQueue to run jobs outside the request cycle and give users a way to see what ran, what failed, and what was retried.",
    system: [
      "FastAPI accepts immediate and scheduled jobs. PostgreSQL persists job state, attempt history, and results.",
      "Redis coordinates worker leases. A recovery process requeues abandoned jobs when a worker stops renewing its lease.",
      "Retries can rerun a handler, so handlers need to tolerate replay. Jobs that exhaust their retry budget move to a dead-letter queue.",
      "The dashboard shows job status, attempt history, and results. Prometheus and Grafana expose queue and worker metrics.",
    ],
    process: [
      "Built a sales CSV workflow to exercise uploads, background processing, and results in the dashboard.",
      "Tested recovery by stopping a worker mid-checksum, then checking that the retried job returned the expected hash and recorded a lease expiration.",
    ],
    result:
      "Released v0.1.0. In a five-minute local benchmark at 100 requests per second, job submission latency was 35 ms at p95 and 50 ms at p99, with zero failed requests.",
    handLabel: "every attempt has a history",
    links: {
      repo: "https://github.com/visweshdev/RelayQueue",
    },
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
