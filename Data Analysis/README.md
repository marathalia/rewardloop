# Synthetic rewards analysis

Two notebooks contain all generation and analysis code. No private dataset or separate Python script is required.

1. **01 - Synthetic data exploration.ipynb** generates fictional events, checks their structure and plots activity, categories and the ordered funnel.
2. **02 - Customer analysis.ipynb** fits behavior groups, calculates category scores, compares thresholds and exports the dashboard JSON.

## Run

Use Python 3.11 or newer. From this folder:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r notebook-requirements.txt
jupyter lab
```

On Windows, use `.venv\Scripts\activate`. Run notebook 1 from top to bottom, then notebook 2. Both run calculations by default and replace only synthetic files in this project.

The saved notebook outputs can be read without execution. Local HTML previews in `reports/` are optional browser copies.

## Files

- `data/synthetic_events.csv`: generated event history, included for reproducibility.
- `output/`: generated local customer tables and checks. Rerunning creates this folder.
- `../lib/reward-catalog.json`: invented offers with explicit categories; shared by analysis and app.
- `../lib/dashboard-data.json` and `../lib/preference-dashboard-data.json`: calculated summaries read by the app.

## Definitions

An event is one generated action. A session is a generated visit, and a customer can have several sessions. The ordered funnel requires each stage to occur after the previous stage in the same session. A redeem-screen visit is not a completed redemption.

Behavior groups are fitted from activity measures, excluding reward categories. Preference scores use catalogue categories and explicit action weights. The generator does not use real customer profiles, copied company distributions or the original project dataset. Synthetic findings are not evidence of real customer preferences or business lift.
