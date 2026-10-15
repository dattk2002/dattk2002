# GitHub Profile Cards Implementation Plan

> **For agentic workers:** Use executing-plans inline. The user approved local implementation, then authorized publication through multiple commits and PRs on 2026-10-16. Preserve the reviewed result and split delivery into dependent PRs.

**Goal:** Add reliable, branded, self-updating GitHub statistics and technology cards to the existing profile.
**Architecture:** A dependency-free Node generator fetches aggregate GitHub data, renders desktop/tablet/mobile SVGs and refreshes README text equivalents. Daily GitHub Actions automation preserves the last good output on failure.
**Tech Stack:** Node.js 24, GitHub GraphQL via gh CLI, SVG, Markdown, GitHub Actions.
**Spec:** `docs/superpowers/specs/2026-10-15-profile-cards-design.md`

## Global Constraints

- Preserve banner and existing prose; use English and existing colors.
- Branches, commits, pushes and PR creation are authorized for this profile change. Keep merging, remote workflow dispatch and portfolio changes outside the current delivery scope.
- No external dependencies or credential output; public language/repository data only.
- Daily calendar dates are GitHub-defined; UTC+7 chooses today and grace behavior.

## Review Focus

- Missing/duplicate days and cross-year boundaries must not inflate totals/streaks.
- Private aggregate counts must not be presented as categorized commits or expose identities.
- Pagination and zero-language repositories must not silently truncate or divide by zero.
- API errors must preserve checked-in assets and workflow staging must remain bounded.
- GitHub Markdown must retain mobile source selection and accessible text alternatives.

### Task 1: Data collection and statistics

Files: `scripts/stats.mjs`, `scripts/github.mjs`, `scripts/profile.config.mjs`, `tests/stats.test.mjs`, `tests/github.test.mjs`.
Interfaces: `calculateStreaks(days, today)`, `aggregateLanguages(repositories, options)`, `collectProfile({now, query})` returns a sanitized snapshot consumed by rendering.

- [x] Write and run failing tests for timezone rollover, zero-today grace, gaps, leap/year boundaries, fork/private exclusion, weighted language bytes and Other.
- [x] Implement calculations and paginated GraphQL collection; validate missing/invalid data, reject partial/error responses.
- [x] Test collection failure and snapshot privacy with controlled API fixtures, then obtain real aggregate data.

### Task 2: Cards and README

Files: `scripts/render.mjs`, `scripts/update-profile.mjs`, `assets/tech-icons.json`, generated `assets/*`, `README.md`.
Interfaces: `renderCards(snapshot)` returns filename-to-SVG map; `updateReadme(readme, snapshot)` replaces only marked statistics content.

- [x] Build SVGs in the established brand with desktop/tablet/mobile variants, shared primitives, labels and empty states.
- [x] Integrate cards and a generated accessible table into README without rewriting existing sections.
- [x] Verify XML and escaped text, real statistics, mobile/desktop layouts and local asset references.

### Task 3: Automation and delivery

Files: `.github/workflows/profile-cards.yml`, `docs/profile-cards.md`, `package.json`, `.gitattributes`.

- [x] Add test/generate/render commands and narrow daily/manual workflow, with optional read token and bot identity.
- [x] Document data scopes, private contribution limitations, token setup, schedule caveats and local regeneration.
- [x] Run full test suite, live generator, workflow validation and browser checks at 390/768/1280 widths; save preview outside committed assets.
- [x] Request fresh code review and UX review, fix material findings and inspect final diff/status.

## Execution record

- 2026-10-15: Existing checkout is clean and matches remote master. Work locally in this checkout to honor the user's ban on unsolicited branches; no isolation is needed for another concurrent task here.
- 2026-10-15: GitHub API confirms private aggregate counts are present but category counters can be smaller. Make that distinction explicit.

- Final review: independent reviewer checked data correctness, privacy, workflow, rendering and tests. Fixed tablet readability with dedicated variants, fitted long commit counts, added both years for cross-year streaks, and repaired SVG accessible-name references.
- Verification: 20 tests pass, including a RED→GREEN cross-year range regression. All generated SVGs parse as XML. actionlint 1.7.12 validates the workflow. Independent GitHub calendar-year totals sum to 1,871, matching the snapshot.
- Browser: 390/768/1280px previews load correct variants without horizontal overflow; keyboard links have visible focus; Enter toggles the numeric disclosure; dark cards work on both light/dark backgrounds. No application console errors; one pre-existing browser-extension content-script error was observed. Screenshots are in ignored preview/.
- Ruling: supplement the initial desktop/mobile design with tablet variants because scaled desktop labels were too small at 768px.
- Preview server was externally terminated once (exit 143); restarted with a PTY. Standalone preview/index.html remains usable without the server.
- No commit, push, remote workflow dispatch or portfolio changes were performed. The schedule has been statically validated, not executed on GitHub.

## Follow-up complete — 2026-10-16

- Replaced Overview with calendar-based GitHub Stats; added active-day, inclusive-30-day and best-day calculations. Removed unused repository/star/commit/PR/review queries and snapshot fields. Updated snapshot schema to version2.
- Added meaningful RED→GREEN checks for inclusive date boundaries, empty activity and removing incomplete counters from published output; all23 tests pass.
- Added narrow/intermediate mastheads, four card sizes and a preview that approximates GitHub profile sidebar width.
- Independently reviewed data and responsiveness. Fixed both material findings: month-label/cell overlap in the wide heatmap and unreadable intermediate-width masthead.
- Browser audit at320,390,479,480,640,767,768,879,880,1024,1100,1101,1280,1440px: correct sources, all assets loaded, no page overflow. Rendered bounding-box checks found no clipped text in any layout; corrected all new-card text overlaps. Original desktop masthead retains its intentional tight line spacing.
- Keyboard disclosure exposes new statistics and no obsolete counters. Light-background preview loads correctly. Screenshot and audit JSON evidence saved in ignored preview/. No GitHub writes, commits or pushes.

## Publication plan — 2026-10-16

- The user approved publication and requested multiple commits and PRs after reviewing the completed result.
- PR 1: data collection, statistics, tests, sanitized snapshot and pinned icons; base `master`.
- PR 2: responsive cards and mastheads, README integration, local preview and usage documentation; base PR 1.
- PR 3: scheduled automation and design/verification records; base PR 2.
- Retain the stacked branch history and describe dependencies in each PR. Merge in order using merge commits, or retarget/reconcile later PRs if a different merge strategy is chosen.
- Re-run tests, SVG/path validation and actionlint before publication. The scheduled workflow remains unexecuted until GitHub actually reports a run.
