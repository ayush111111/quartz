# AGENTS.md

Architecture notes for working in this Quartz (v4.5.1) repo.

## What this is

Quartz is a **static site generator**: it compiles the Markdown vault in [content/](content/) into static HTML/CSS/JS at build time. There is no server runtime and no client-side framework shipped — output is plain static files, published at **https://ayush111111.github.io/quartz/** (see [Deploying](#deploying) for the path caveat).

## Component model

[quartz/components/*.tsx](quartz/components/) are **Preact** components (same JSX/function-component shape as React), but they render **once, at build time**, via `preact-render-to-string`. Nothing hydrates in the browser — no client-side Preact runtime ships.

- [quartz/components/types.ts](quartz/components/types.ts) — `QuartzComponent` type: a function component with optional static `css`, `beforeDOMLoaded`, `afterDOMLoaded` string fields.
- [quartz/components/renderPage.tsx](quartz/components/renderPage.tsx) — assembles the full-page JSX tree (head/header/sidebars/content/footer) per content file and calls `render(doc)` to flatten it to an HTML string. Also resolves Obsidian transclusions (`renderTranscludes`).
- [quartz/components/index.ts](quartz/components/index.ts) — exports every available component.

Interactivity (search, graph, dark mode, popovers, SPA nav, etc.) is **not** Preact — it's hand-written vanilla TS in [quartz/components/scripts/*.inline.ts](quartz/components/scripts/), attached via a component's `afterDOMLoaded`/`beforeDOMLoaded` field and bundled with esbuild. E.g. `Search.tsx` → `scripts/search.inline.ts`.

## Build pipeline

[quartz/build.ts](quartz/build.ts) is the entry point (invoked via [quartz/bootstrap-cli.mjs](quartz/bootstrap-cli.mjs), exposed as the `quartz` bin in `package.json`):

1. **glob** all files in `content/`
2. **parseMarkdown** ([quartz/processors/parse.ts](quartz/processors/parse.ts)) — runs the `transformers` plugin list (configured in `quartz.config.ts`) over each `.md` file: remark/rehype passes (frontmatter, Obsidian/GFM markdown, syntax highlighting, TOC, link crawling, LaTeX, etc.) → produces a hast tree + vfile metadata per file.
3. **filterContent** ([quartz/processors/filter.ts](quartz/processors/filter.ts)) — `filters` plugins decide which parsed files get emitted (e.g. `RemoveDrafts`).
4. **emitContent** ([quartz/processors/emit.ts](quartz/processors/emit.ts)) — `emitters` plugins ([quartz/plugins/emitters/](quartz/plugins/emitters/)) write the actual output: `ContentPage` calls `renderPage()` per note, `FolderPage`/`TagPage` build listing pages, `ContentIndex` builds the search index/RSS/sitemap, `Assets`/`Static` copy files.

`--watch` mode uses `chokidar` for incremental rebuilds + browser live-reload (same file).

## Config files

- [quartz.config.ts](quartz.config.ts) — *what runs*: the transformer/filter/emitter plugin list, plus global settings (theme, colors, locale, `enableSPA`, `enablePopovers`, analytics, etc.)
- [quartz.layout.ts](quartz.layout.ts) — *where things go*: which components occupy the head/header/beforeBody/afterBody/left-sidebar/right-sidebar/footer slots, for content pages vs. list pages. Consumed by `renderPage.tsx`.

## Plugin types ([quartz/plugins/](quartz/plugins/))

- `transformers/` — markdown/AST processing, one file per concern: `ofm.ts` (Obsidian compat), `gfm.ts`, `syntax.ts`, `toc.ts`, `links.ts`, `latex.ts`, `citations.ts`, `lastmod.ts`, `frontmatter.ts`, `description.ts`, `roam.ts`, `oxhugofm.ts`, `linebreaks.ts`
- `filters/` — decide what gets published at all: `draft.ts`, `explicit.ts`
- `emitters/` — decide what gets written to disk: `contentPage.tsx`, `folderPage.tsx`, `tagPage.tsx`, `contentIndex.tsx`, `aliases.ts`, `assets.ts`, `static.ts`, `favicon.ts`, `componentResources.ts`, `404.tsx`, `cname.ts`, `ogImage.tsx`

## Deploying

This is a GitHub Pages **project** site, so it is served from a `/quartz/` path prefix:

```
https://ayush111111.github.io/quartz/notes/<slug>
```

`baseUrl` at [quartz.config.ts:19](quartz.config.ts#L19) is the bare host with **no** path, so it does not match the live URL. Building a live URL from `baseUrl` alone produces a 404.

When verifying something on the live site, **always fetch a known-published page as a control in the same check**. A wrong path prefix 404s every URL, which is indistinguishable from a page having been successfully removed. This has already caused one false "confirmed removed" report.

Publishing flow: branch off `v4` → PR → merge to `v4`. [.github/workflows/deploy.yml](.github/workflows/deploy.yml) triggers on push to `v4` and takes about a minute. A change is not live until that run completes; pushing a branch or opening a PR does nothing on its own.

## Content conventions

Posts live in [content/notes/](content/notes/) (dated, usually `YYYY-MM-DD-Title.md`) and [content/misc/](content/misc/) (essays, undated names). [content/index.md](content/index.md) is the About page.

Frontmatter fields beyond the Quartz defaults, declared in the `DataMap` block at the bottom of [quartz/plugins/transformers/frontmatter.ts](quartz/plugins/transformers/frontmatter.ts) and rendered by [quartz/components/ContentMeta.tsx](quartz/components/ContentMeta.tsx):

| Field | Effect |
|---|---|
| `draft: true` | Unpublishes the note entirely. `RemoveDrafts` is active at [quartz.config.ts:76](quartz.config.ts#L76), so no HTML is emitted and the page drops out of the search index and graph. |
| `assisted: prose \| summary` | AI-disclosure marker in the meta line. `prose` = an LLM wrote the prose from the author's material; `summary` = an LLM summarized source the author read. |
| `assistedNote: "..."` | Hover text for the marker. Falls back to a per-kind default. Prefer a specific sentence about what the LLM actually did over the generic one. |
| `written: YYYY-MM-DD` | For posts whose dateline refers to the period they describe rather than when they were composed. Renders as "written May 2026". Opt-in; only set where the gap is real. |

Note that Quartz passes **arbitrary** frontmatter keys through to `fileData.frontmatter`, so adding a new field needs only a type declaration plus rendering, not a transformer change.

Renaming a note changes its URL and silently breaks any existing link to it. Add the old path to `aliases:` when renaming.

## Writing content

Match the author's voice; do not "improve" it. When the author supplies text, reproduce it verbatim rather than polishing it. Avoid em dashes and other LLM-flavored phrasing in anything written for `content/`.

Much of the existing prose in `content/notes/` was LLM-drafted and reads that way. Do not treat it as a style reference.

## Docs

Full feature documentation lives in [docs/features/*.md](docs/features/) (one file per feature) and [docs/plugins/](docs/plugins/) (one file per plugin) — check there before re-deriving behavior from source.
