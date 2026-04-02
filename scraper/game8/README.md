# Digimon Evolution Requirements Scraper

A modular Python pipeline to extract and merge Digimon evolution requirements from Game8 into your dataset.

## 📋 Overview

This pipeline has 4 Python scripts that work together:

1. **`scrape_links.py`** - Extract Digimon names and profile URLs from the Game8 list page
2. **`scrape_requirements.py`** - Scrape each Digimon's page for evolution requirements
3. **`merge.py`** - Merge extracted requirements into your main `digimon.json`
4. **`run_pipeline.py`** - Run all three steps in sequence (recommended)

## 🛠️ Setup

### Prerequisites

```bash
pip install beautifulsoup4 requests lxml
```

Or if using requirements.txt:
```bash
pip install -r requirements.txt
```

### File Structure

```
/data/
  raw/
    game8/
      554944.html          ← Your downloaded Game8 list page
  processed/
    digimon.json          ← Original dataset (will be backed up and updated)
    digimon-links.json    ← Generated in STEP 1
    digimon-requirements.json  ← Generated in STEP 2
    digimon.json.backup   ← Backup created in STEP 3

/scraper/game8/
  scrape_links.py
  scrape_requirements.py
  merge.py
  run_pipeline.py
  README.md
```

## 🚀 Quick Start

### Option 1: Run Complete Pipeline (Recommended)

```bash
cd scraper/game8/
python run_pipeline.py
```

This runs all 3 steps in sequence with automatic error handling.

### Option 2: Run Steps Individually

```bash
# STEP 1: Extract URLs
python scrape_links.py

# STEP 2: Scrape requirements (this takes time!)
python scrape_requirements.py

# STEP 3: Merge into dataset
python merge.py
```

### Option 3: Test with Limited Data

```bash
# Test with only 10 Digimon
python run_pipeline.py --limit 10

# Resume from a specific index
python run_pipeline.py --limit 50 --start 100
```

## 📊 Output Structure

The pipeline adds a `requirements` field to each Digimon:

```json
{
  "id": 430,
  "name": "Omnimon",
  "pre_evolutions": ["WarGreymon", "MetalGarurumon"],
  "evolutions": ["Omnimon Zwart", "Omnimon (X Antibody)"],
  "icon": "...",
  "image": "...",
  "requirements": {
    "agent_rank": 8,
    "paths": [
      {
        "type": "dna",
        "conditions": [
          { "digimon": "WarGreymon", "requirement": "Daring" },
          { "digimon": "MetalGarurumon", "requirement": "Friendly" }
        ]
      },
      {
        "type": "mode_change",
        "from": "Omnimon Zwart"
      }
    ]
  }
}
```

### Requirement Types

- **`agent_rank`** (number): Minimum Agent Rank needed
- **`level`** (number): Minimum level required
- **`paths`** (array): Evolution paths, each with:
  - **`dna`**: DNA Digivolution requiring multiple Digimon with conditions
  - **`mode_change`**: Change from another Digimon form
- **`null`**: No special requirements (base evolution or no data available)

## ⚙️ Technical Details

### Rate Limiting
- 1 second delay between requests (configurable in `scrape_requirements.py`)
- Automatic retry with exponential backoff on failures

### Error Handling
- Missing pages are logged but don't stop the pipeline
- Name matching is fuzzy (handles spacing/capitalization issues)
- Automatic backup of original `digimon.json`

### Logging
All scripts provide detailed logging:
```
2026-03-31 12:30:45,123 - INFO - Loading datasets...
2026-03-31 12:30:45,456 - INFO - Loaded 450 Digimon
```

## 📝 Customization

### Adjust Request Delay
In `scrape_requirements.py`, line ~20:
```python
REQUEST_DELAY = 1  # seconds between requests
```

Increase if Game8 blocks your requests; decrease to speed up (cautiously).

### Process Specific Digimon
```bash
# Test with first 5 Digimon
python run_pipeline.py --limit 5

# Resume from Digimon #100
python run_pipeline.py --start 100 --limit 50
```

### Match Custom Names
The merge script uses fuzzy matching in `find_best_match()`. 
Edit this function in `merge.py` for custom name handling.

## 🐛 Troubleshooting

### "HTML file not found: .../554944.html"
→ Make sure you've downloaded the Game8 list page to `/data/raw/game8/554944.html`

### "No requirements section found"
→ The page structure may have changed. Check raw HTML or Game8 site.
→ These Digimon will have `requirements: null` (normal for base forms)

### "Failed to fetch URL after 3 attempts"
→ Network issue or Game8 rate limiting
→ Increase `REQUEST_DELAY` in `scrape_requirements.py`
→ Try again later or use `--start` to resume

### "No matching requirements found"
→ Digimon name doesn't match exactly
→ This is logged as a warning but doesn't fail the pipeline
→ Check the backup `digimon.json.backup` - original is preserved

### Merge shows "Unmatched" Digimon
→ Name mismatch between Game8 and your JSON
→ Edit `find_best_match()` in `merge.py` for custom handling
→ Or manually add missing entries to `digimon-requirements.json`

## 📈 Performance

- **Extraction**: ~1 second (parsing local HTML)
- **Scraping**: ~450 Digimon × 1 second = ~7-8 minutes
- **Merge**: ~1 second

Total runtime: ~8-10 minutes for complete dataset

## ✅ Verification

Each script logs detailed progress. Look for:
- ✓ Success messages with counts
- ✗ Failed/missing items (logged as warnings)
- Sample output showing first few entries with/without requirements

## 📚 References

- Game8 Digimon Wiki: https://game8.co/games/Digimon-Story-Time-Stranger
- Evolution Requirements Format: See structure above

## 📄 License

These scripts are part of your Digimon Planner project.

---

**Need to pause and resume?** Use the `--start` and `--limit` flags to resume from where you left off:
```bash
# Process 100 at a time
python run_pipeline.py --start 0 --limit 100
python run_pipeline.py --start 100 --limit 100
python run_pipeline.py --start 200 --limit 100
```
