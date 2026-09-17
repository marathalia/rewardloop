# RewardLoop

### Synthetic rewards personalisation portfolio

The public portfolio adaptation of **RewardPulse**, originally developed as a university project involving Singtel. **RewardLoop** is the fictional brand used for this independent demonstration. It is not an official Singtel product or service.

A rewards-app portfolio project built with fully synthetic data. Explore customer groups, reward preferences and session drop-offs, then try a campaign generator and customer simulator.

**All customers, merchants, offers and events are fictional. Results do not represent a real company. No real rewards, payments or campaign deliveries are available.**

## Built with

Next.js, React, TypeScript and Tailwind CSS for the app; Python, pandas and scikit-learn for analysis; optional OpenAI integration for campaign copy.

## Synthetic dataset

The included dataset contains 54,823 generated events from 1,800 fictional customers across 6,465 sessions, with 24 invented offers. Both notebooks recreate the data and dashboard summaries using a fixed seed. These figures describe only the synthetic demonstration.

## Run the app

Requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Open the local address shown in the terminal. The dashboard reads the included JSON summaries and runs without Python or an API key. Campaign generation uses template copy when no key is configured.

For optional live campaign copy, provide `OPENAI_API_KEY` in your shell or an ignored `.env.local` file. Never commit a key. `OPENAI_GENERATE_ARTWORK=false` keeps the original vector illustrations; image generation is an optional paid feature. No key is included in this folder.

```bash
npm run typecheck
npm run build
npm start
```

## What to explore

- **Overview:** synthetic activity totals, customer groups and category engagement.
- **Behavior Clusters:** six fitted groups, their activity and ideas to test.
- **Reward Preferences:** transparent category-score rules and synthetic customer examples.
- **Reward Funnel:** sessions reaching each stage in order, including repeat visits.
- **Campaign Generator:** rule-based ranking, optional AI copy and demo approval.
- **Customer App Simulator:** interest selection, reward discovery and local demo vouchers.

Campaign scenarios are fictional examples. They use the same reward catalogue as the simulator. Simulator activity is separate from the historical synthetic dataset and does not automatically retrain the model. Generated copy requires review; it is not evidence of business improvement.

## Folder guide

| Folder | Purpose |
|---|---|
| `Data Analysis/` | Two executed notebooks and the synthetic event dataset |
| `app/`, `components/` | Website, API routes and interactive screens |
| `lib/` | Fictional catalogue, generated summaries and recommendation rules |
| `public/images/` | Original SVG illustrations and RewardLoop wordmark |

The source path is notebook 1 → `synthetic_events.csv` → notebook 2 → dashboard JSON. Both notebooks can be rerun without private data. See the [analysis instructions](<Data Analysis/README.md>).

## Portfolio scope

The event generator uses a fixed seed and explicit browsing assumptions. Group separation, threshold sensitivity and source-to-dashboard reconciliation demonstrate analytical practice on that generated dataset. They do not validate predictions about real customers or establish personalisation lift.

The application code was adapted from an earlier rewards prototype. This folder contains no previous Git history, company dataset, copied notebook findings or inherited image assets.

## Deployment

Import this repository into Vercel as a Next.js project with the repository root as the root directory. The dashboard and template-copy fallback work without API credentials. Optional API keys belong in server-side environment variables, never in source code or `NEXT_PUBLIC_*` variables. Add access controls and usage limits before enabling paid generation on a public deployment.
