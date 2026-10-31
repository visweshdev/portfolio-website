# Viswesh Kesarla — Portfolio

A personal portfolio built as a "digital scrapbook" — a black-and-grid editorial
site with hand-arranged collage visuals you can actually drag around, a
signature Three.js curve that reacts to your cursor, synthesized retro sound
effects, and a small in-browser arcade with six playable games.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP, Lenis
and Three.js. No CMS, no database, no backend — every page is static at
build time, and all content lives in typed files under `data/`.

## Features

- **Collage visuals you can drag** — the RecoverRL, ReMem, PaperForge and URL-Shortener project
  scrapbooks are made of individually draggable pieces (pointer events,
  no snap-back), not static images. On touch screens they stay still so
  swiping over them scrolls the page and taps reach the project link.
- **A 3D racing line you drive along** — on the homepage, a glowing track
  sits behind the whole page and the camera drives down it as you scroll.
  Each section is a timing gantry the camera passes through as that section
  reaches the top of the screen; particles stream along the track, the
  camera sways toward the cursor, and clicking empty space fires a pulse
  of light down the line. A wireframe F1 car waits on the line with a
  low-poly Viswesh (white tee, grey jeans, white sneakers) standing beside
  it. He says hi once the intro clears, follows your cursor with his head,
  waves and says something (in a speech bubble) when you hover him; click
  him and he walks over, climbs into the cockpit and drives off (scroll
  first and he jogs over by himself). Click the moving car and he waves
  and shouts from the cockpit; he calls out each section as the car
  passes its gantry; at the bottom of the page the car pulls up past the
  chequered line and he climbs out to wave ("let's talk ↓"), hopping back
  in if you scroll up. Easter eggs: double-click him for a spin, click the
  moving car five times quickly for a donut. With sound on, the car makes
  a short engine note as it pulls away. Keyboard users get a "Send the
  driver to the car" button (visible on focus). Once he's in, the car drives just ahead of the camera as you scroll — parked when
  you stop, pulling away when you
  scroll fast, drifting tail-out through bends, lurching forward when
  clicked — up to a chequered finish line painted across the track where
  the page ends. Wireframe models of a camera, `</>`, a network node, a
  database stack and a chip float beside the start: they turn to look at
  the cursor, swell and glow on hover, and spin with a flash when clicked.
- **An F1 start-lights loading screen** on every page load — five pairs
  of red lights, a random hold, then lights out and the site appears.
  Click or press any key to skip; not shown under reduced motion, or on
  navigations within the site.
- **A 3D photo wall** on the homepage and /photography — prints hung on a
  curved wall you drag to look along, with inertia; click one to open it.
  It replaces the photo grid where it runs (decided in CSS before first
  paint); everyone else gets the grid.
- **A 3D arcade cabinet** around every game — marquee, side panels, bezel
  and control deck in CSS 3D, turning toward the cursor, with the real game
  playing on its screen. It scales itself down to always fit the window.
  The homepage game cards open their game in place, no page change.
- **Scroll-driven motion** — the projects slide sideways in a pinned rail,
  project pipelines light up stage by stage as a data packet hops along
  them, headlines rise in word by word, section labels decode like a
  telemetry readout, a skills ticker speeds up with your scroll (and can
  be dragged or swiped sideways by hand), and the footer ends on a
  chequered finish line. The Wipro RAG pipeline instead runs a looping
  glow from stage to stage while it's on screen.
- **Section navigation** — the top nav scrolls to each homepage section in
  place (and comes back to the homepage at that section from other pages).
  A full load or reload always starts at the top, on the hero: browser and
  ScrollTrigger scroll restoration are off, and a leftover `#section` in
  the address is dropped (see the inline script in `app/layout.tsx` and
  `SmoothScroll.tsx`).
- **Tactile hover** — project and game cards tilt toward the cursor with a
  moving highlight; project collages ripple and colour-split in
  proportion to cursor speed. Photos keep a simple fade-in and hover lift.
- **Page transitions** — every navigation wipes the new page in over the
  old one (View Transitions API via React's `<ViewTransition>`).

The 3D racing line runs on phones and tablets too, in a lighter mode
(lower pixel ratio; tap the driver to send him to the car, or just scroll).
The cursor-driven effects (the photo wall, tilt, distortion, the pinned
rail, the hero's 3D objects) only run for a
mouse/trackpad visitor without `prefers-reduced-motion`
(`lib/useRichMotion.ts`); touch screens get simpler versions. Under
reduced motion nothing 3D runs and three.js is never downloaded. Note that Windows' "Animation effects" setting being off makes
browsers report reduced motion, which turns all of this off.
- **A custom cursor** — a soft dot that grows over anything interactive
  (any element with a `data-cursor` attribute). Disabled on touch devices;
  under `prefers-reduced-motion` it snaps to the pointer instead of easing.
- **A photo lightbox** — click any photograph to view it full-screen.
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
- Real, editable content for projects, work experience and photography.

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
  template.tsx              Wraps each page in <ViewTransition> for the page-wipe transition
  page.tsx                  Homepage — composes all the section components below
  not-found.tsx              Custom 404
  icon.tsx, opengraph-image.tsx   Generated favicon and social-preview card
                               (each project page has its own, in projects/[slug]/)
  sitemap.ts, robots.ts       Generated /sitemap.xml and /robots.txt
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
  *Collage.tsx                The project "scrapbook" visuals (registered in collages.ts)
  collages.ts                  Registry mapping a project slug to its collage
  DraggablePiece.tsx           Pointer-events-based drag behavior used by the collages
  three/                      three.js scenes: TrackScene (homepage track), trackPath, HeroObjects,
                               RacingCar (car + driver logic), Driver (the low-poly figure),
                               FinishLine, PhotoWall
  LightsOut.tsx                F1 start-lights loading screen
  SplitHeading.tsx, ScrambleLabel.tsx, FlowStrip.tsx   Word-by-word headlines, decoding labels, animated pipelines
  HorizontalRail.tsx, SkillsTicker.tsx                 Pinned sideways project rail, scroll-reactive ticker
  Tilt.tsx, HoverDistort.tsx, HoverDistortFilter.tsx   Card tilt, hover ripple/colour-split (+ its shared SVG filter)
  games/ArcadeCabinet.tsx      The CSS 3D cabinet around an open game
  games/TeaserGames.tsx        Homepage game cards that open their game in place
  Magnetic.tsx                  Cursor-attraction wrapper used on key CTAs
  AnimatedNumber.tsx             Scroll-triggered count-up used for the Wipro stats
  SoundToggle.tsx                 The nav's sound on/off control
  SoundLink.tsx                    A next/link that plays a sound — keeps link-only sections Server Components
  PhotoLightbox.tsx                Full-screen photo view (opened from PolaroidImage)

data/                      All editable content lives here — see "Editing content" below
  projects.ts, photography.ts, experience.ts, skills.ts, games.ts, nav.ts

lib/                       Small framework-agnostic hooks/utilities
  gsapConfig.ts               Registers GSAP plugins once (ensureGsap())
  lenisInstance.ts             Exposes the single Lenis instance (used by the logo's scroll-to-top)
  sessionStart.ts               A timestamp set once per page load — backs the "LAP" clock
  sound.ts, useSound.ts           The synthesized sound engine and its React hook
  useReducedMotion.ts, usePointerType.ts, useElapsedSinceStart.ts   SSR-safe hooks built on useSyncExternalStore
  useGameLoop.ts, useBestScore.ts, canvas.ts   Shared arcade infrastructure
  useRichMotion.ts             Gate for heavy effects: fine pointer and no reduced motion
  intro.ts                     Shared constants for the lights-out intro
  carEvents.ts                 Event the hero listens for once the driver heads to the car
  useModal.ts                  Scroll lock (incl. Lenis), Escape, focus trap + restore for dialogs
  photoGrid.ts                 The asymmetric photo grid's spans and matching image `sizes`
  site.ts                      Site URL, name, description and the Person JSON-LD

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
- **Projects** — add an entry to `data/projects.ts`. Set `links.repo`
  and/or `links.demo` to show "SOURCE CODE" / "LIVE DEMO" buttons; `stages`
  renders as the pipeline strip on the detail page. Set
  `status: "in-development"` for work in progress: it gets an IN
  DEVELOPMENT badge and isn't counted as "shipped". Array order is display
  order, so put what you're working on now first. If it needs its own
  scrapbook visual, build a `<YourProject>Collage.tsx` (see
  `PaperForgeCollage.tsx` for the pattern — wrap each piece in
  `DraggablePiece`) and register it in `components/collages.ts`.
- **Work experience** — `data/experience.ts`.
- **About text** — written directly in `components/About.tsx`.
- **Nav links / resume / social links** — `data/nav.ts`. Each nav item
  names a homepage section `id`; keep those ids on the sections.
- **Arcade games** — `data/games.ts` holds the catalog metadata; each
  game's actual logic lives in its own file under `components/games/`,
  wired up in `GameLoader.tsx`. `lib/sound.ts` lists the available effects
  (`click`, `pop`, `success`, `fail`, `score`, `whoosh`) if you want to add
  more sound cues.

## Design system

- **Colors** — CSS custom properties in `app/globals.css` (`--color-bg`,
  `--color-fg`, `--color-accent`, etc.), mapped into Tailwind via `@theme
  inline` so they're usable as ordinary utilities (`bg-bg`, `text-accent`, …).
  `fg-faint` is for lines and borders only; the quietest color for text is
  `fg-subtle`, which keeps WCAG AA contrast (≥4.5:1).
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
- three.js is never loaded under reduced motion, and otherwise only after
  the loading screen has cleared and the browser is idle, so the page
  itself comes up first. On touch screens the track renders at a capped
  pixel ratio with fewer particles, and the scene stops drawing while the
  tab is hidden; and the photo wall uses small resized textures from Next's image optimizer.
- The glow on the 3D track is layered additive tubes rather than a
  post-processing pass, so there's no extra render target per frame.
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
- Dialogs (the arcade, the photo lightbox) trap focus, close on Escape,
  and return focus to whatever opened them; game status is announced via
  an `aria-live` region.
- Sound is opt-in only, never autoplays.
- Semantic HTML, `aria-label`s on icon-only controls, and visible
  `:focus-visible` states throughout.

## Deployment

This is a standard static-output-capable Next.js app — it deploys as-is to
[Vercel](https://vercel.com/new) (zero config) or any Node host that can run
`next build && next start`.

Set `NEXT_PUBLIC_SITE_URL` to the public domain (e.g.
`https://visweshkesarla.com`) so Open Graph images, the sitemap and
robots.txt use absolute URLs on it. On Vercel it falls back to the
project's production domain automatically.
