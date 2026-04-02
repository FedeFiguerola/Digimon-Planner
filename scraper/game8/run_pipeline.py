"""
Run the complete Digimon data pipeline in sequence.

This script executes all three steps:
1. Extract Digimon URLs from the Game8 list page
2. Scrape evolution requirements from each Digimon's page
3. Merge requirements back into the main digimon.json file

Run with: python run_pipeline.py [--limit N] [--start N] [--skip-links]
"""

import argparse
import json
import logging
import sys
from pathlib import Path

# Add scraper directory to path
SCRAPER_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRAPER_DIR))

import scrape_links
import scrape_requirements
import merge

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def run_pipeline(limit: int = None, start: int = 0, skip_links: bool = False, workers: int = 1):
    """
    Run the complete pipeline.
    
    Args:
        limit: Process only this many Digimon (for testing)
        start: Start from this index (for resuming)
        skip_links: If True, skip step 1 (extract links) and use existing digimon-links.json
        workers: Number of parallel workers for scraping (default: 1 = sequential)
    """
    project_root = Path(__file__).parent.parent.parent
    
    logger.info("\n" + "="*70)
    logger.info("DIGIMON DATA PIPELINE")
    logger.info("="*70)
    
    try:
        links_file = project_root / 'data' / 'processed' / 'digimon-links.json'
        
        # STEP 1: Extract links (optional)
        if not skip_links:
            logger.info("\n[STEP 1/3] Extracting Digimon profile URLs...")
            logger.info("-"*70)
            
            html_file = project_root / 'data' / 'raw' / 'game8' / '554944.html'
            if not html_file.exists():
                logger.error(f"HTML file not found: {html_file}")
                return False
            
            digimon_links = scrape_links.extract_digimon_links(str(html_file))
            
            if not digimon_links:
                logger.error("Failed to extract Digimon links")
                return False
            
            links_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(links_file, 'w', encoding='utf-8') as f:
                json.dump(digimon_links, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✓ Found {len(digimon_links)} Digimon profiles")
        else:
            # Use existing links file
            logger.info("\n[STEP 1/3] Using existing digimon-links.json (--skip-links)")
            logger.info("-"*70)
            
            if not links_file.exists():
                logger.error(f"Links file not found: {links_file}")
                logger.error("Cannot skip links extraction without an existing links file")
                return False
            
            with open(links_file, 'r', encoding='utf-8') as f:
                digimon_links = json.load(f)
            
            logger.info(f"✓ Loaded {len(digimon_links)} Digimon profiles from existing file")
        
        # STEP 2: Scrape requirements
        logger.info("\n[STEP 2/3] Scraping evolution requirements...")
        logger.info("-"*70)
        
        if limit:
            logger.info(f"Processing limit: {limit} Digimon (for testing)")
        if workers > 1:
            logger.info(f"Using {workers} parallel workers")
        
        requirements_file = project_root / 'data' / 'processed' / 'digimon-requirements.json'
        scrape_requirements.scrape_digimon_requirements(
            str(links_file), 
            str(requirements_file),
            start_index=start,
            limit=limit,
            workers=workers
        )
        
        # STEP 3: Merge
        logger.info("\n[STEP 3/3] Merging requirements into digimon.json...")
        logger.info("-"*70)
        
        digimon_file = project_root / 'data' / 'processed' / 'digimon.json'
        output_file = project_root / 'data' / 'processed' / 'digimon.json'
        generation_file = project_root / 'data' / 'processed' / 'digimon-generation.json'
        
        stats = merge.merge_requirements(
            str(digimon_file),
            str(requirements_file),
            str(output_file),
            str(generation_file) if generation_file.exists() else None
        )
        
        merge.print_statistics(stats)
        merge.verify_merge(str(output_file), sample_count=5)
        
        logger.info("\n" + "="*70)
        logger.info("✓ PIPELINE COMPLETE!")
        logger.info("="*70)
        logger.info(f"\nUpdated file: {output_file}")
        
        return True
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Run the complete Digimon data pipeline'
    )
    parser.add_argument(
        '--limit', 
        type=int,
        help='Process only this many Digimon (useful for testing)',
        default=None
    )
    parser.add_argument(
        '--start',
        type=int,
        help='Start processing from this index (useful for resuming)',
        default=0
    )
    parser.add_argument(
        '--skip-links',
        action='store_true',
        help='Skip step 1 (extract links) and use existing digimon-links.json'
    )
    parser.add_argument(
        '--workers',
        type=int,
        help='Number of parallel workers for scraping (default: 10)',
        default=10
    )
    
    args = parser.parse_args()
    
    success = run_pipeline(limit=args.limit, start=args.start, skip_links=args.skip_links, workers=args.workers)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
