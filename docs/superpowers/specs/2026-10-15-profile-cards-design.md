# GitHub profile cards

The user approved the complete implementation: retain the current banner and prose, add English GitHub stats, language, contribution/streak and technology cards, and a daily generator. On 2026-10-16, the user authorized publishing the reviewed implementation through multiple commits and PRs in `dattk2002/dattk2002`. Merging and manually dispatching the workflow remain separate actions.

## Presentation

Reuse the masthead palette: background #090B0C, panel #101416, foreground #F1EFE7, muted #A7ADB0, lime #C7F36B, steel #7EA2B8, border #2A3135. SVGs contain their own vector artwork and system-font stacks. No scripts, external image loads, animation or new runtime dependency. Static GitHub images do not support the website's GSAP interaction model.

Stats and language panels sit together on desktop, stack on mobile. Contributions show all-time total, current/longest streaks and a past-12-month calendar. Mobile splits the calendar into two readable halves. Technology uses 24 verified tools in six groups, monochrome logos with visible names. Separate responsive SVGs are selected with `<picture>`. Include text equivalents in a collapsible README section.

## Data and honesty

Use GitHub GraphQL through the installed `gh` CLI, with no token printed or persisted. Fetch all owned public repositories with pagination for language calculations only. Language shares are repository bytes, exclude forks and this generated profile repository, retain archives, show top six plus Other. Do not describe the shares as skill or time measurements.

Fetch contribution calendars from account creation through today, in calendar-year windows; validate all days and reject incomplete responses. Overlapping calendar padding must be filtered, never double-counted. Rolling activity covers 12 calendar months through the current day. Restricted private counts are included in calendar totals when GitHub exposes them, never inferred into commits/PRs. Do not collect incomplete categorized activity or public repository/star totals for the cards. Store only sanitized aggregates and daily counts, not repository identities or raw private responses.

Use Asia/Ho_Chi_Minh (UTC+7) to decide today's date and current-streak grace. Source day buckets remain GitHub's date labels; do not pretend timestamp-level timezone conversion is possible with a daily calendar. Today at zero does not break yesterday's streak. Missing earlier days are errors during collection; gaps break streaks in the pure calculation. Empty and zero data are valid states.

## Operation

Node.js 24 built-ins only. Workflow runs daily at 02:23 UTC, with manual trigger and narrow write permission. Use the built-in GitHub token by default and optional PROFILE_STATS_TOKEN for additional read access; write commits using the workflow token. A failed fetch exits without replacing the previous cards. The workflow stages only known generated assets and README, commits as github-actions[bot], and never force-pushes. No external card host or paid service.

Document setup, private-data limitations, schedule inactivity caveat and methodology. Verify statistics logic, API failures, generated XML, actual GitHub Markdown rendering, responsive image selection, overflow and console errors. Provide local preview screenshots.

## Approved revision — 2026-10-16

The owner primarily works in private repositories and requested removal of the original Overview. Replace its incomplete commits/public-repos/stars/PR/review display with GitHub Stats based on the shared contribution calendar: past-12-month contributions, active days, last-30-day contributions and best daily count. Remove obsolete counters from collection and published text as well. Keep all-time totals/streaks/heatmap and clearly identify languages as public code only.

Responsive review uses actual profile-width constraints, including the sidebar above 767px. Card variants: 320px narrow at <=479 and768–879 viewport;480px wide at480–767 and880–1100;736px tablet at1101–1439;960px desktop above. Add static narrow/intermediate mastheads, retaining the original desktop SVG. Verify both sides of transitions, SVG text bounds/spacing, heatmap label separation and keyboard/readable details.
