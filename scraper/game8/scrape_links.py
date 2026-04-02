"""
Extract Digimon profile URLs from the Game8 list page.

This script parses the HTML file containing the Digivolution chart and extracts
all Digimon names and their corresponding profile URLs from Game8.

Output: /data/processed/digimon-links.json
"""

import json
import logging
import re
from pathlib import Path
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def extract_digimon_links(html_file_path: str) -> dict:
    """
    Extract all Digimon names and URLs from the Game8 HTML file.
    
    Args:
        html_file_path: Path to the 554944.html file
        
    Returns:
        Dictionary mapping Digimon names to their Game8 profile URLs
    """
    logger.info(f"Reading HTML file from: {html_file_path}")
    
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    digimon_links = {}
    
    # Find all links that match the pattern: /archives/XXXXXX with Digimon names
    # Pattern: href pointing to game8.co/games/Digimon.../archives/XXXXX
    for link in soup.find_all('a', href=re.compile(r'archives/\d+')):
        href = link.get('href', '')
        
        # Extract the Digimon name from link text or alt text
        digimon_name = None
        
        # Try to get from link text
        link_text = link.get_text(strip=True)
        if link_text and not any(keyword in link_text.lower() for keyword in 
                                  ['digivolution', 'evolution', 'chart', 'list', 'episode', 
                                   'planner', 'team', 'personality', 'enhancement']):
            digimon_name = link_text
        
        # Try to get from img alt text
        if not digimon_name:
            img = link.find('img')
            if img:
                alt_text = img.get('alt', '')
                if alt_text and 'Image' not in alt_text:
                    digimon_name = alt_text
        
        # Build full URL and store
        if digimon_name and digimon_name.strip():
            digimon_name = digimon_name.strip()
            
            # Only process if it looks like a Digimon (not a page title)
            if len(digimon_name) > 0 and not any(keyword in digimon_name.lower() 
                                                  for keyword in ['guide', 'walkthrough', 'wiki']):
                
                # Build absolute URL
                if href.startswith('http'):
                    full_url = href
                elif href.startswith('/'):
                    full_url = f"https://game8.co{href}"
                else:
                    full_url = f"https://game8.co/games/Digimon-Story-Time-Stranger/{href}"
                
                # Skip duplicates
                if digimon_name not in digimon_links:
                    digimon_links[digimon_name] = full_url
                    logger.debug(f"Found: {digimon_name} -> {full_url}")
    
    return digimon_links


def main():
    # Define paths
    project_root = Path(__file__).parent.parent.parent
    html_file = project_root / 'data' / 'raw' / 'game8' / '554944.html'
    output_file = project_root / 'data' / 'processed' / 'digimon-links.json'
    
    logger.info("=" * 60)
    logger.info("STEP 1: Extract Digimon Profile URLs")
    logger.info("=" * 60)
    
    # Extract links
    if not html_file.exists():
        logger.error(f"HTML file not found: {html_file}")
        return
    
    digimon_links = extract_digimon_links(str(html_file))
    
    if not digimon_links:
        logger.error("No Digimon links found. Check HTML structure.")
        return
    
    logger.info(f"\nFound {len(digimon_links)} Digimon profiles")
    
    # Save to JSON
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(digimon_links, f, indent=2, ensure_ascii=False)
    
    logger.info(f"✓ Saved digimon-links.json to: {output_file}")
    logger.info(f"\nFirst 5 entries:")
    for i, (name, url) in enumerate(list(digimon_links.items())[:5]):
        logger.info(f"  {i+1}. {name}")
        logger.info(f"     {url}")


if __name__ == '__main__':
    main()
