# Viswesh Kesarla — Portfolio

A personal portfolio built as a "digital scrapbook" — a black-and-grid editorial
site with hand-arranged collage visuals you can actually drag around, a
signature Three.js curve that reacts to your cursor, synthesized retro sound
effects, and a small in-browser arcade with six playable games.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP, Lenis
and Three.js. No CMS, no database, no backend — every page is static at
build time, and all content lives in typed files under `data/`.

## Features

- **Collage visuals you can drag** — the PaperForge/URL-Shortener project
  scrapbooks are made of individually draggable pieces (pointer events,
  no snap-back), not static images.
- **A reactive 3D signature curve** in the hero — magnetically drawn toward
  the cursor, sends a travelling pulse of light down its length on click,
  and automatically stops rendering once scrolled out of view.
- **A custom cursor** that changes label depending on what it's over
  (`VIEW`, `OPEN`, `DRAG`, a directional arrow) — disabled entirely on
  touch devices and under `prefers-reduced-motion`.
- **A small in-browser arcade** — 2048, a Flappy-Bird-style flyer, a
  Wordle-style word game, Memory Match, Connect Four (vs. a simple AI), and
  a reaction-time tester. Each game is its own lazy-loaded chunk; nothing
  loads until you open it.
- **Synthesized sound effects** (Web Audio oscillators, zero audio files)
  on game actions, the hero's click-pulse, and picking up/dropping collage
  pieces — off by default, toggleable from the nav, persisted per-visitor.
- **A "LAP" clock** in the hero that times how long you've been on the
  site — genuinely since you arrived, not since you last landed on the
  homepage (it survives client-side navigation).
- **Magnetic buttons** and scroll-triggered count-up numbers as a couple
  of extra tactile details on the site's key calls to action.
- Real, editable content for projects, work experience, photography, and a
  click-for-a-random-fact box on the About page.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/docs) (App Router, Turbopack, React Server Components) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/docs) (CSS-first config, no `tailwind.config.js`) + custom CSS utilities in `app/globals.css` |
| Animation | [GSAP](https://gsap.com/docs/v3/) + ScrollTrigger, synced to [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling |
| 3D | [Three.js](https://threejs.org/docs/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) |
| Sound | Web Audio API, synthesized on the fly (`lib/sound.ts`) — no audio assets |
| Fonts | [`next/font/google`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) — Space Grotesk, Inter, IBM Plex Mono, Caveat |

## Getting started

**Requirements:** Node.js 20.9+ (developed and tested on Node 24), npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build (also type-checks)
npm run start   # serve the production build locally
npm run lint    # ESLint
npx tsc --noEmit   # type-check only, no build
```

## Project structure

```
app/                      Routes (Next.js App Router)
  layout.tsx               Root layout — fonts, <SmoothScroll>, <CustomCursor>, <Navigation>, <Footer>
  template.tsx              Per-navigation fade-in (Next re-mounts this on every route change)
  page.tsx                  Homepage — composes all the section components below
  not-found.tsx              Custom 404
  globals.css                 Design tokens, the shared `.page-pad` grid, paper/tape/cursor utilities
  projects/                 /projects (all work) + /projects/[slug] (project detail, static params)
  work/                     /work — full work-experience page
  photography/               /photography — full gallery page
  playground/                /playground — arcade + experiments
  about/                     /about — about + contact

components/                One component per file, PascalCase
  games/                     The arcade: GameFrame (shared chrome), GameLoader (per-game dynamic
                             import so each game is its own JS chunk), and the 6 games themselves
  icons.tsx                  Hand-drawn-feeling line icons used as floating decoration
  *Collage.tsx                The PaperForge/URL-Shortener "scrapbook" visuals
  DraggablePiece.tsx           Pointer-events-based drag behavior used by the collages
  HeroScene.tsx                 The Three.js signature curve
  Magnetic.tsx                  Cursor-attraction wrapper used on key CTAs
  AnimatedNumber.tsx             Scroll-triggered count-up used for the Wipro stats
  SoundToggle.tsx                 The nav's sound on/off control

data/                      All editable content lives here — see "Editing content" below
  projects.ts, photography.ts, experience.ts, skills.ts, facts.ts, games.ts, nav.ts

lib/                       Small framework-agnostic hooks/utilities
  gsapConfig.ts               Registers GSAP plugins once (ensureGsap())
  lenisInstance.ts             Exposes the single Lenis instance (used by the logo's scroll-to-top)
  sessionStart.ts               A timestamp set once per page load — backs the "LAP" clock
  sound.ts, useSound.ts           The synthesized sound engine and its React hook
  useReducedMotion.ts, usePointerType.ts, useElapsedSinceStart.ts   SSR-safe hooks built on useSyncExternalStore
  useGameLoop.ts, useBestScore.ts, canvas.ts   Shared arcade infrastructure

public/
  photography/                Real photos served by the site (see below)
  resume.pdf                   Served at /resume.pdf, linked from the nav
```

## Editing content

Everything a visitor sees is data-driven — you should rarely need to touch a
component to change content.

- **Photos** — drop a file in `public/photography/` and add an entry to
  `data/photography.ts` (`src`, `caption`, `category`, `year`, `rotation`).
  Leaving `src: null` renders an explicit "placeholder" frame instead of a
  broken image, for slots you haven't shot yet.
- **Projects** — add an entry to `data/projects.ts`. If it needs its own
  scrapbook visual, build a `<YourProject>Collage.tsx` (see
  `PaperForgeCollage.tsx` for the pattern — wrap each piece in
  `DraggablePiece`) and register it in the `COLLAGES` map in
  `ProjectRow.tsx` and `app/projects/[slug]/page.tsx`.
- **Work experience** — `data/experience.ts`.
- **About "random facts"** — `data/facts.ts`. Keep them true and short; the
  box on `/about` cycles through them on click.
- **Nav links / resume / social links** — `data/nav.ts`.
- **Arcade games** — `data/games.ts` holds the catalog metadata; each
  game's actual logic lives in its own file under `components/games/`,
  wired up in `GameLoader.tsx`. `lib/sound.ts` lists the available effects
  (`click`, `pop`, `success`, `fail`, `score`, `whoosh`) if you want to add
  more sound cues.

## Design system

- **Colors** — CSS custom properties in `app/globals.css` (`--color-bg`,
  `--color-fg`, `--color-accent`, etc.), mapped into Tailwind via `@theme
  inline` so they're usable as ordinary utilities (`bg-bg`, `text-accent`, …).
- **Grid** — `.page-pad` (in `globals.css`) is the one shared max-width +
  gutter used by every section, so content lines up edge-to-edge across the
  whole site regardless of viewport width. `<GridBackground />` draws the
  faint technical grid line pattern seen behind most sections.
- **Type** — Space Grotesk for display/headlines, Inter for body copy, IBM
  Plex Mono for metadata/labels (`.label-mono`), Caveat for the occasional
  handwritten sticky-note label (`.label-hand`).
- **Motion** — `<Reveal>` is the one scroll-in animation used everywhere
  (fade + lift via GSAP ScrollTrigger). Respects `prefers-reduced-motion`
  throughout — the custom cursor, parallax, draggable pieces, magnetic
  buttons, the count-up numbers, and the 3D scene all fall back to
  static/inert behavior when it's set.
- **Sound** — off by default (unsolicited audio on a portfolio is
  obnoxious); a visitor has to opt in via the nav toggle, and the choice
  persists in `localStorage`.

## Performance notes

- The Three.js hero scene, and every arcade game, are lazy-loaded
  (`next/dynamic`, `ssr: false`) as separate JS chunks — none of that code
  ships on pages that don't use it.
- The hero's 3D render loop pauses automatically (via `IntersectionObserver`)
  once you've scrolled it out of view, instead of rendering every frame for
  the whole session.
- Photos are served through `next/image` with per-position `sizes` values
  (the asymmetric grid means the "feature" photo and the small supporting
  ones render at very different widths) and `quality={95}` — Next.js 16
  requires non-default qualities to be explicitly allow-listed, which is
  done in `next.config.ts`.
- `poweredByHeader` is disabled.

## Accessibility

- Every animated/interactive effect (cursor, parallax, dragging, magnetic
  buttons, count-up numbers, the 3D scene, page-transition fade) checks
  `prefers-reduced-motion` and falls back to static, fully-functional
  behavior rather than just disabling itself.
- The custom cursor and drag interactions are gated on `pointer: fine` —
  touch devices get their platform's native cursor and on-screen game
  controls instead.
- Sound is opt-in only, never autoplays.
- Semantic HTML, `aria-label`s on icon-only controls, and visible
  `:focus-visible` states throughout.

## Deployment

This is a standard static-output-capable Next.js app — it deploys as-is to
[Vercel](https://vercel.com/new) (zero config) or any Node host that can run
`next build && next start`.

## A note on the content

Photos in `public/photography/` were sent over WhatsApp during development,
which recompresses images fairly aggressively — if you're replacing them,
send the originals through something that doesn't recompress (a Document
attachment, Drive/Photos link, AirDrop, USB) to get the full benefit of the
`quality={95}` image pipeline.
