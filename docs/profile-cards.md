# Profile cards

These cards extend the existing GitHub profile masthead. They are standalone SVGs with no browser JavaScript, remote fonts or third-party card host. English labels, dark charcoal, lime highlights, steel details and fine grid lines match the profile's visual system.

## Preview before publishing

From this repository, with Node.js 24 and an authenticated `gh` CLI:

```bash
npm run preview
```

Open **http://localhost:4173**. Resize the browser to inspect phone, tablet and desktop layouts. The preview uses GitHub's actual Markdown renderer with local, unpublished assets, plus a local stylesheet approximating the GitHub README container. The light-background button checks how the dark cards sit inside GitHub's light theme. It does not publish, commit or push anything.

The preview accounts for GitHub's profile sidebar: above 767px it reserves approximately the sidebar and gutters, and caps the README at 896px before internal padding. Below that point it uses the full mobile width. This is deliberately narrower than a full-width repository README, and remains an approximation of GitHub's current UI. The cards have narrow, wide, tablet and desktop variants so labels remain readable around the sidebar breakpoint. The masthead has narrow and intermediate variants with the same identity and message.

The command also writes `preview/index.html`, which can be opened directly from the file manager. After it has been built once, opening that file needs neither a server nor authentication. `preview/` is ignored by Git. Screenshots may be saved there for review. Re-run the preview command after editing the README to refresh its rendered HTML.

## Regenerate and test

No `npm install` is required; the generator uses Node built-ins and the GitHub CLI.

```bash
npm test
npm run cards          # fetch fresh GitHub data and regenerate cards + text table
npm run cards:render   # render again from the saved, sanitized snapshot (offline)
npm run preview:build  # refresh the standalone preview, then exit
```

`scripts/profile.config.mjs` owns the username, language exclusions and curated 54-tool stack. `scripts/github.mjs` collects data; `scripts/stats.mjs` calculates totals and streaks; `scripts/render.mjs` creates desktop/tablet/mobile cards and the accessible README table. `assets/github-data.json` contains aggregate counters, public language shares and daily contribution counts only. It contains no token, repository names or private content.

## What the numbers mean

- **GitHub stats:** contribution totals use the same calendar as the streaks, including shared private contributions. The owner primarily works in private repositories, so incomplete commit/PR/review counters and public-only repository/star counts are intentionally absent.
- **Active days:** days with at least one contribution within the displayed 12-month period.
- **Last 30 days:** the sum for the current day and previous 29 days, including shared private counts.
- **Best day:** the highest daily contribution count within the displayed 12-month period. The text table gives its date; ties choose the earliest date. An empty calendar shows zero without inventing a date.
- **All-time contributions:** sum of daily contribution counts from account creation through today. Every calendar-year request must succeed. Calendar padding is filtered and incomplete days are rejected rather than silently treated as zero.
- **Current streak:** consecutive days with at least one contribution. Today at zero retains yesterday's streak until today ends. A missed yesterday resets it. Weekends count.
- **Longest streak:** the longest consecutive sequence in the complete retrieved history, including cross-year sequences. Ties retain the earliest sequence.
- **Timezone:** Asia/Ho_Chi_Minh (UTC+7) determines today, the update date and current-day grace. GitHub supplies already-bucketed daily counts, so these are **not** a timestamp-level reconstruction of contributions in Vietnam time. The schedule runs after both UTC and Vietnam have entered the same date.
- **Calendar:** the past 12 calendar months. The small-screen variant divides complete weeks into two strips; it shows the same days, without dropping or duplicating them. Cell intensity: 0, 1–3, 4–9, 10–19, 20+ contributions. This custom scale is intentionally fixed.
- **Private activity:** shared private counts can appear in total/calendar/streak data. The text equivalent discloses the restricted count. It never publishes private repository identities or content. Changing token access or GitHub privacy settings can change historical totals.
- **Languages:** code bytes returned by GitHub for original, owned, public repositories, including archived projects. Exclude forks and this profile repository to prevent generated artwork from skewing the result. Use the top six plus Other; no manually invented weights or skill ratings. GitHub's language detection handles generated/vendor code according to each source repository's Linguist configuration.
- **Technology stack:** 54 technologies: 48 verified against the owner's [CV](https://www.dattk.dev/api/cv) on 2026-10-16, plus Three.js, PixiJS, Fastify, Inngest, Zod and OpenTelemetry verified in OathFront and HuntingAlice source on 2026-10-28, displayed as one continuous grid without category sections. The list includes languages, frameworks, UI libraries, ORMs, infrastructure and testing tools used in the CV's work experience and projects. It is independent of public byte shares; some substantial projects are private, so this section intentionally differs from the languages chart.

GitHub is authoritative for what counts as a contribution. See the [GraphQL user/contribution schema](https://docs.github.com/en/graphql/reference/users), [profile contribution rules](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference), and [supported Markdown images](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#images).

## Daily automation

The companion automation change adds `.github/workflows/profile-cards.yml` at **02:23 UTC / 09:23 Vietnam time**, with a manual **Run workflow** option. The schedule becomes eligible to run once that workflow and the reviewed implementation are merged into the default branch. Publishing a PR does not activate the schedule or dispatch a run.

The workflow uses the built-in `GITHUB_TOKEN` by default. If additional read access is needed for private contribution aggregates, create a suitable personal access token and add it as a repository Actions secret named **`PROFILE_STATS_TOKEN`** in Settings → Secrets and variables → Actions. GitHub documents `read:user` as the optional scope for private/internal contribution information. Use the least permission needed for the chosen token type; broad private repository content access is not required for this design. Never paste a token into Markdown, source code or chat.

The optional token is supplied only to the read step. Checkout and pushes use the workflow token, restricted to `contents: write`; organization policies or branch protection may still prohibit those writes. If so, the workflow reports failure and the last published cards remain intact. Do not bypass repository protection just for these cards.

Updates commit as `github-actions[bot]`, not as the owner, and stage only the twelve generated SVGs, sanitized data and README. The static masthead variants are edited manually. A rejected push is not force-retried. API failures stop before output files are replaced. The update date remains visible so stale output is not presented as fresh.

GitHub schedules are best-effort and can be delayed. Scheduled workflows in public repositories may be disabled after 60 days without activity; check the Actions tab if the update date stops changing. See [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule). No third-party paid service is introduced; normal GitHub account limits/policies apply.

## Icons and accessibility

The `assets/how-i-ship*.svg` cards contain 54 color icons on transparent backgrounds, each with a centered 20×20 logo viewport in a consistent 28×28 layout slot and preserved aspect ratio. There are no surrounding tiles or borders. [SVGL](https://svgl.app/docs/api) supplies most artwork; [Devicon](https://github.com/devicons/devicon), [Lobe Icons](https://github.com/lobehub/lobe-icons), [Simple Icons](https://github.com/simple-icons/simple-icons), the official [.NET brand](https://github.com/dotnet/brand), and [Lucide](https://github.com/lucide-icons/lucide) fill the remaining gaps. Native color SVGs retain their colors. Formerly white monochrome marks use bright colors directly on their SVG paths; SQLAlchemy lettering uses coral for dark-background readability. These display tints are portfolio styling, not claimed official brand variants.

`assets/how-i-ship-icons.json` records each source, pinned revision where available, normalized SVG and display-tint notes. Exa and Langfuse use the color SVGs downloaded directly from their official [Exa brand package](https://exa.ai/brand) and [Langfuse asset library](https://langfuse.com/brand), preserved in `assets/technology-icons/exa.svg` and `assets/technology-icons/langfuse.svg` with SHA-256 hashes in the catalog. Source URLs, presentation notes and license notices are embedded in every card as metadata, so the cards are self-contained and make no external image requests. Internal SVG IDs are isolated per icon to keep gradients and masks independent. SQL uses a generic database symbol; SignalR uses the official .NET family mark, matching its package branding. React and React Native share React's logo. New project icons also use pinned Simple Icons paths, the official PixiJS repository artwork and the official Inngest website mark. Their raw SVGs and SHA-256 hashes are preserved in the same directory and catalog; PixiJS has its solid background removed, and both official marks have tighter transparent viewBoxes. No technology uses a placeholder abbreviation.

The README references the standalone `how-i-ship*.svg` files, which the daily statistics workflow does not overwrite. The legacy `tech-stack*.svg` files and `assets/tech-icons.json` are not the artwork displayed in this section.

`technologyNotes` in `scripts/profile.config.mjs` supplies 32 short usage captions, including Gemini's Grounded Search label. Captions describe documented work from the CV, portfolio, OathFront and HuntingAlice, such as AI research/tracing, push messaging, ORMs, hosting, media processing and testing. They appear directly below the relevant tool name without splitting the grid into categories. The SVG descriptions and README image alt text include the same context.

SVGs contain titles/descriptions and direct labels; the README supplies meaningful image alt text and a collapsible text equivalent for statistics. Technology names appear in the image alt text. Both linked cards are standard keyboard-accessible links. No motion needs to be disabled. The original desktop masthead is preserved unchanged, with a separate mobile layout.
