# Philip Ondieki · Portfolio

Philip Ondieki's portfolio: a dark, minimal first screen, a header that types the name on scroll, a small preview card that bounces up under the strip and becomes the featured project's frame, then eight projects in two groups, each row with its own scroll reveal, an About section, a footer on every page, and a page per project. Divider lines draw themselves as they scroll into view.

- Next.js 16 (App Router) with static export (`output: "export"`), deployed on Vercel
- TypeScript (strict, `noUncheckedIndexedAccess`), ESLint (`next/core-web-vitals` and TypeScript rules), Prettier
- Tailwind CSS v4. Tokens are CSS variables in `globals.css`, mapped to class names in `tailwind.config.ts`.
- Inter via `next/font/google` (latin, weights 400 and 500)
- No UI or animation libraries: CSS, IntersectionObserver and one shared requestAnimationFrame scroll scheduler

## Requirements

- Node.js 20.9 or newer (22 recommended), npm 10 or newer
- ffmpeg with `libx264` and `libwebp`, only for `npm run media`
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - Windows: `winget install ffmpeg`, then run the script from Git Bash or WSL

## Install and run

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:3000
npm run lint         # ESLint, fails on any warning
npm run typecheck    # TypeScript, no emit
npm run build        # static site in ./out
npm start            # serve ./out at http://localhost:3000
npm run format       # Prettier
```

> The build downloads Inter from Google Fonts, so it needs network access to `fonts.googleapis.com`.

## Encode project media

```bash
npm run media -- afriresearch
# or with explicit sources (slug, video, poster):
npm run media -- afriresearch afriresearchpreview.webm afriresearch.png
npm run media -- mkulima-sharp mkulimasharppreview.webm mkulimasharp2.png
npm run media -- dual-scope dualscopeengineeringpreview.webm dualscopeengineering.png
npm run media -- webmerchants webmerchantspreview.webm webmerchants.png
npm run media -- eveshield eveshieldpreview.webm eveshield2.png
npm run media -- nairobialert nairobialertpreview.webm nairobialert.png
```

Siledge and MamaShield have no media yet (`media: null`) and show a placeholder.

For each slug, `scripts/encode-media.sh` writes four files to `public/media/<slug>/`:

| File               | Settings                                                                    | Budget   |
| ------------------ | --------------------------------------------------------------------------- | -------- |
| `<slug>-1280.mp4`  | H.264 High, 1280px wide, CRF 26, preset slow, yuv420p, +faststart, no audio | < 1.5 MB |
| `<slug>-720.mp4`   | H.264 Main, 720px wide, CRF 28, preset slow, yuv420p, +faststart, no audio  | < 1.5 MB |
| `<slug>-1280.webp` | Poster, quality 75                                                          | < 90 KB  |
| `<slug>-720.webp`  | Poster, quality 75                                                          | < 90 KB  |

The script prints each file's size and exits non-zero if one is over budget. Sources stay outside `/public` and are never shipped. Only MP4 is published.

## How to add a project

1. **Media (optional).** Put the source video and poster in the repository root, then run `npm run media -- <slug> <video> <poster>` and check that every file is within budget. Output goes to `public/media/<slug>/`. No media yet? Skip this step and set `media: null`: the row, the card and the project page show a placeholder (the project name, then "Preview coming soon").
2. **Data.** Add an entry to `projects` in `src/data/projects.ts`, in the position it should appear within its group. There is a commented example in that file.
   - `group`: `"production"` or `"hackathon"`. Groups render in the order of `projectGroups`, each with a divider and its label. Each group's header sits in its first project's stage.
   - `reveal`: the row's scroll effect, one of `curtain`, `tilt`, `blinds`, `iris`, `counterSlide`, `diagonalWipe`, `stack` (see [Row reveals](#row-reveals)). `cardMorph` is only for the featured project.
   - Homepage row: `slug`, `name`, `tagline`, `description`, `tags`.
   - Project page: `firstField` (`{ label, value }`, e.g. Client or Event), `stack` (one item per line), `liveUrl`, `caseTags`, and `body` (paragraphs).
   - `media`: `getProjectMedia("<slug>")` or `null`.
3. **Featured project (optional).** `featuredProjectSlug` in `src/data/home.ts` picks the project whose frame the preview card becomes. Give that project `reveal: "cardMorph"`.
4. Run `npm run build` and commit the data change plus `public/media/<slug>/`. The row, its group count, its links and the static page at `/work/<slug>` come from the data. No component changes are needed.

Field labels (Stack, Link, Live Site, Back, the placeholder text) live in `projectPageCopy` in `src/data/projects.ts`.

## Project pages and transitions

`/work/[slug]` is pre-rendered for every project (`generateStaticParams`, `dynamicParams = false`). Unknown slugs get the 404 page. A homepage row links to its page from both the media frame and the name. The frame link only works once the frame has finished morphing to full size.

Moving between the homepage and a project page uses the native View Transitions API (`src/lib/viewTransition.ts`). The row's media frame grows into the full-width project media and the rest of the page crossfades. Back (the link, or the browser) reverses it and returns to the row. Browsers without view transitions (Firefox, Safari before 18), and visitors who prefer reduced motion, get a 300ms fade instead. Set `NEXT_PUBLIC_SITE_URL` in production so Open Graph images get absolute URLs.

## Deploy to Vercel

`vercel.json` sets the build command (`npm run build`), the output directory (`out`) and cache headers. `package.json` pins Node 22.

1. Import the repository at [vercel.com/new](https://vercel.com/new). Vercel reads `vercel.json`, so the defaults need no changes.
2. Push to the production branch to deploy. Every other branch gets a preview URL.

Or deploy from the command line:

```bash
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

## Structure

```
scripts/encode-media.sh         MP4 + WebP poster encoder (npm run media)
src/
  app/                          layout, page, not-found, work/[slug]/page, globals.css
  components/
    layout/   Header, Footer, Container, RouteTransitions
    about/    AboutSection, AboutBlock, FocusColumns, EngagementList,
              ConnectList, ConversationList, NairobiClock
    hero/     Hero, Strip, Monogram, NotificationCard
    project/  ProjectHero, ProjectVideo, ProjectInfo, BackLink
    work/     WorkStack, WorkRow, WorkMedia, RevealFrame, GroupHeader,
              ProjectLink, ProjectTags
    motion/   TypingText, MaskReveal, CardMorph, FadeIn, RouteFade, DrawLine
    media/    LazyVideo, Poster, MediaPlaceholder
  hooks/      useInView, useReducedMotion, useMediaQuery, useNetworkQuality,
              useScrollScheduler, usePageVisibility, useFreeSpace,
              useRevealGate, useIncomingTransition
  lib/        motion.ts (every motion value), media.ts (paths from slug),
              scrollScheduler.ts (the page's only scroll listener),
              drawLines.ts (scroll-linked divider lines),
              reveals/ (one module per row effect, plus the registry),
              revealStore.ts (per-row text and full-size gates),
              morphStore.ts (card <-> frame handoff state),
              playback.ts (one video plays at a time),
              workLayout.ts (groups -> stages), stageStore.ts (stage geometry),
              viewTransition.ts (home <-> project transitions), site.ts, anchors.ts
  types/      Project, ProjectGroup, RevealName, ProjectMedia, HomeContent,
              AboutContent, SiteContent
  data/       home.ts (homepage copy), projects.ts (projects and project page labels),
              about.ts (every About string), site.ts (email, footer, copyright year)
public/media/<slug>/            encoded media
```

## Design tokens

| Token                | Value     | Use                   |
| -------------------- | --------- | --------------------- |
| `ink`                | `#000000` | Background            |
| `fg`                 | `#FFFFFF` | Primary text          |
| `muted`              | `#8A8A8A` | Secondary text        |
| `divider`            | `#262626` | 1px lines             |
| `tile`               | `#0D0D0D` | Strip tiles, media    |
| `tile-fg`            | `#BDBDBD` | Strip text            |
| `chip`               | `#1A1A1A` | Tag chip background   |
| `chip-fg`            | `#8A8A8A` | Tag chip text         |
| `placeholder-border` | `#1F1F1F` | Placeholder border    |
| `placeholder-fg`     | `#5A5A5A` | "Preview coming soon" |

Tailwind's default palette is replaced, so these are the only colours available in class names.

## Motion

Every duration, easing, stagger, scale range, bounce value and typing speed lives in `src/lib/motion.ts`. `motionStyles()` turns them into CSS custom properties and the bounce keyframes in `<head>`, so CSS and TypeScript share one source. With `prefers-reduced-motion: reduce`, the page is static: no fade-in, marquee, preview card or scale, the text is visible, and the header name swaps instantly. Video playback rules still apply.

### Preview card and morph

The preview card and the featured project's frame are one object. `featuredProjectSlug` in `src/data/home.ts` picks the project.

- **At the top:** the card rises under the strip 1.6s after load, holds, then drops away, up to 10 times. The frame stays hidden. The card shows the same poster file and crop as the frame.
- **First scroll:** in the same frame, the card is retired and the frame takes its exact spot and size. If the card was mid-bounce or hidden, the frame rises into the spot in 300ms.
- **Scrolling down:** until the Siledge stage pins under the header (smoothstep), the frame grows and travels into the row. It's a FLIP transform from the card's rect to the frame's own rect, both measured in document coordinates outside the scroll frame. The corner radius goes from 10px to 6px and the 1px border fades out, both counter-scaled so they look right at every size.
- **Row text and video:** the text and divider reveal when the morph is 70% done. The video is attached at that point and plays only at full size.
- **Scrolling back:** the frame reverses to the card's spot and drops out at the top. The card never returns in that page view.

Values live under `cardMorph` and `notificationCard` in `src/lib/motion.ts`. With reduced motion or on viewports under 500px tall, there is no card and no morph; the frame sits in its row at full size.

### Row reveals

Every other row reveals its media frame with its own effect, picked by the project's `reveal` field. Each effect is a small module in `src/lib/reveals/` with `setup`, `apply(e)` and `reset`, registered in `src/lib/reveals/index.ts`. `RevealFrame` is the engine shared by all of them:

- Every project is a stage pinned under the header (`WorkStack`); the next stage rises over it and fully replaces it. Progress runs over the whole hand-over: `p = clamp((vh − stageTop) / (vh − headerHeight))`, eased with smoothstep into `e`. Stage offsets are measured with sticky off (mount, resize, fonts), never inside the scroll frame. A stage whose content is taller than the screen scrolls normally. A covered stage pauses its video.
- The row's text reveals at `e ≥ 0.7`. The video attaches then, and it plays and the link works only at `e ≥ 0.98`.
- Effects animate only `transform`, `opacity` and `clip-path`. There is no blur.
- A row subscribes to the shared scroll scheduler only within the viewport plus 200px.
- With reduced motion, every effect is skipped and the frame sits at its final state.

| Effect         | Row           | What it does                                                                      |
| -------------- | ------------- | --------------------------------------------------------------------------------- |
| `cardMorph`    | Siledge       | The preview card grows into the frame (see above)                                 |
| `curtain`      | AfriResearch  | Two doors part from a vertical line in the centre                                 |
| `tilt`         | Mkulima Sharp | The frame lies back in 3D, then lifts up to face the viewer                       |
| `blinds`       | Dual Scope    | Vertical strips over the media fold down one after another                        |
| `iris`         | Webmerchants  | A circle opens from the centre                                                    |
| `counterSlide` | EveShield     | The frame slides in from the right, the media inside moves the other way          |
| `diagonalWipe` | NairobiAlert  | A triangle spreads from the top-left corner to the bottom-right                   |
| `stack`        | MamaShield    | Slides up over the pinned NairobiAlert stage, whose frame scales down and darkens |

Every value (offsets, angles, strip count, stagger, scales) lives under `reveals` in `src/lib/motion.ts`, with desktop and mobile variants. To add an effect, write a module that implements `RevealEffect`, add its name to `RevealName` in `src/types/index.ts`, and register it.

### Homepage performance

- One video plays at a time (`src/lib/playback.ts`). Starting one pauses the other.
- Rows below the first screen use `content-visibility: auto` with an intrinsic size, so they skip rendering until near. The featured row never does, since the card's frame lives there.
- Coming back from a project page restores the scroll relative to the clicked row, not by raw `scrollY`, because rows above may not have their real height yet.

### Divider lines

Every divider (project rows, group headers, About blocks, Focus columns, engagement rows, footer) is a `DrawLine`: a 1px `<div aria-hidden="true">` that scales from the left as it scrolls into view and back as it scrolls out.

- `p = clamp((vh − lineTop) / (0.75 × vh))`, eased with smoothstep: from the bottom of the viewport to its top quarter. Lines in pinned stages are measured from the stage's flow position, so they stay drawn while pinned. A line too close to the end of the page to reach that point completes at the furthest scroll instead, so the footer line always finishes drawing.
- Split dividers: each later segment starts 0.1 later in progress, so the halves read as one stroke left to right.
- Line positions are measured on mount, resize, font load and when a line comes within range, never inside the scroll frame. Only lines within the viewport plus 200px subscribe to the shared scheduler (`src/lib/drawLines.ts`).
- Reduced motion, or no JavaScript: lines are fully drawn.

Values live under `drawLine` in `src/lib/motion.ts`.

## About section and footer

The About section closes the homepage after the Hackathons group (`#about`, not a separate page). Its seven blocks share the project-row grid: label on the left, content on the right, a split divider above. All copy lives in `src/data/about.ts`; fade timing is `about` in `src/lib/motion.ts`.

The Location block is a live analogue clock (`NairobiClock`). It reads Nairobi time with `Intl.DateTimeFormat` (`timeZone: "Africa/Nairobi"`), never the visitor's own zone, ticks on each full second, and stops while off screen or in a hidden tab. Its hands render only after mount, so the static HTML holds just the face. The accessible name updates once a minute. With reduced motion there is no seconds hand.

The footer is in the root layout, so it shows on every page. The email address and copyright year come from `src/data/site.ts`; the year is fixed in data, so the static export never depends on the build date.
