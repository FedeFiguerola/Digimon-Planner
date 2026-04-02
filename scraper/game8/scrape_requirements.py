"""
Scrape evolution requirements for each Digimon from Game8.

This script fetches each Digimon's profile page and extracts evolution requirements
in a structured format with support for:
- General requirements (Agent Rank, etc.)
- DNA Digivolution with personality conditions
- Mode Changes

Output: /data/processed/digimon-requirements.json
"""

import json
import logging
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional, Dict, List, Any, Tuple
from bs4 import BeautifulSoup
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Request settings
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
REQUEST_DELAY = 1  # seconds between requests to avoid rate limiting


def normalize_digimon_name(name: str) -> str:
    """Normalize Digimon name for matching."""
    return name.strip()


def fetch_page(url: str, retries: int = 3) -> Optional[str]:
    """
    Fetch page content with retry logic.
    
    Args:
        url: URL to fetch
        retries: Number of retry attempts
        
    Returns:
        HTML content or None if failed
    """
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            if attempt < retries - 1:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}. Retrying...")
                time.sleep(2)
            else:
                logger.error(f"Failed to fetch {url} after {retries} attempts: {e}")
                return None
    
    return None


def parse_requirements_section(html_content: str, digimon_name: str) -> Optional[Dict[str, Any]]:
    """
    Parse the evolution requirements section from a Digimon page.
    
    Handles both standalone requirement tables and section-based layouts.
    
    Args:
        html_content: HTML page content
        digimon_name: Name of the Digimon
        
    Returns:
        Structured requirements dict or None
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Look for section titled "<Digimon Name> Evolution Requirements"
    requirement_section = None
    
    # Pattern: Looking for heading that contains "Evolution Requirements" or similar
    for heading in soup.find_all(['h2', 'h3', 'h4', 'h5']):
        heading_text = heading.get_text(strip=True)
        # Must have "requirement" AND "evolution" keywords together
        has_evolution = 'evolution' in heading_text.lower() or 'digivolution' in heading_text.lower()
        has_requirement = 'requirement' in heading_text.lower()
        has_digimon_name = digimon_name.lower() in heading_text.lower()
        
        if has_digimon_name and has_evolution and has_requirement:
            requirement_section = heading
            break
    
    if not requirement_section:
        logger.warning(f"No requirements section found for {digimon_name}")
        return None
    
    logger.debug(f"[parse_requirements_section] {digimon_name}: Found heading")
    
    # First, try to find a requirements table (e.g., Omnimon structure)
    # The table directly contains all requirements in a single cell
    table = requirement_section.find_next('table')
    if table:
        # Try to extract from the table cell with requirements
        cells = table.find_all('td')
        if len(cells) >= 2:
            # Second cell typically contains the requirements
            requirements_cell = cells[1]
            requirements = _extract_structured_requirements_from_element(requirements_cell, digimon_name)
            if requirements:
                return requirements
    
    # Fallback: Collect text from siblings (for other layouts)
    content = []
    current = requirement_section.find_next_sibling()
    
    while current:
        # Stop at next h1-h5 heading (major section boundary)
        if current.name in ['h1', 'h2', 'h3', 'h4', 'h5']:
            break
        
        content.append(current)
        current = current.find_next_sibling()
    
    # Parse the requirements text from siblings
    full_text = '\n'.join([str(elem) for elem in content])
    requirements_text = BeautifulSoup(full_text, 'html.parser').get_text('\n', strip=True)
    
    # Extract structured requirements
    requirements = _extract_structured_requirements(requirements_text, digimon_name)
    
    # Return requirements if any were found (check all types)
    if requirements and (requirements.get('paths') or 
                        'agent_rank' in requirements or 
                        'level' in requirements or 
                        'stats' in requirements or
                        'agent_skills' in requirements):
        return requirements
    
    return None


def _extract_structured_requirements_from_element(element, digimon_name: str) -> Optional[Dict[str, Any]]:
    """
    Extract structured requirements directly from HTML elements in a table cell.
    
    This handles:
    - Agent Rank requirements in divs with 'align' class
    - DNA Digivolution sections with multiple conditions
    - Mode Changes with "from X" format
    - Stats requirements
    - Agent Skills/Bonds requirements
    
    Args:
        element: BeautifulSoup element (typically a table cell)
        digimon_name: Name of the Digimon
        
    Returns:
        Structured requirements dict or None
    """
    requirements = {
        "paths": []
    }
    
    # Get all divs with class 'align' which contain individual requirements
    requirement_divs = element.find_all('div', class_='align')
    
    if not requirement_divs:
        # Try extracting from plain text as fallback
        text = element.get_text(strip=True)
        if text:
            return _extract_structured_requirements(text, digimon_name)
        return None
    
    dna_conditions = []
    in_dna_section = False
    
    for div in requirement_divs:
        # Use get_text() to get text with preserved line breaks
        div_text = div.get_text().strip()
        logger.debug(f"[_extract_structured_requirements_from_element] Processing div: {repr(div_text[:100])}")
        
        # Split by bullet points (・) to handle multiple requirements in one div
        # Some divs contain multiple requirements separated by newlines with bullet points
        # e.g., "・ 46 Bonds of Valor Agent Skills learned\n・ 46 Bonds of Philanthropy Agent Skills learned"
        requirements_to_process = []
        
        if '・' in div_text:
            # Split by bullet point and filter empty strings
            # The bullet point appears at the start of each requirement line
            parts = [p.strip() for p in div_text.split('・') if p.strip()]
            requirements_to_process = parts
        else:
            # No bullet point, process as single item
            requirements_to_process = [div_text]
        
        # Process each requirement line individually
        for requirement_line in requirements_to_process:
            cleaned_text = requirement_line.strip()
            if not cleaned_text:
                continue
                
            logger.debug(f"    Processing requirement: {repr(cleaned_text[:70])}")
            
            # Check for Agent Rank
            agent_rank_match = re.search(r'agent\s+rank\s+(\d+)', cleaned_text, re.IGNORECASE)
            if agent_rank_match:
                requirements['agent_rank'] = int(agent_rank_match.group(1))
                logger.debug(f"      -> Agent Rank: {requirements['agent_rank']}")
                continue
            
            # Check for Level
            level_match = re.search(r'level\s+(\d+)', cleaned_text, re.IGNORECASE)
            if level_match:
                requirements['level'] = int(level_match.group(1))
                logger.debug(f"      -> Level: {requirements['level']}")
                continue
            
            # Check for Stats
            stat_match = re.search(r'(\d+)\+?\s*(?:(Max|Min|Minimum)\s+)?(HP|SP|ATK|DEF|INT|SPI|SPD)(?![a-z])', cleaned_text, re.IGNORECASE)
            if stat_match:
                value = int(stat_match.group(1))
                stat_qualifier = stat_match.group(2)
                stat_name = stat_match.group(3).upper()
                
                if not requirements.get('stats'):
                    requirements['stats'] = {}
                
                key = f"{stat_qualifier.lower()}_{stat_name}" if stat_qualifier else stat_name
                requirements['stats'][key] = value
                logger.debug(f"      -> Stat {key}: {value}")
                continue
            
            # Check for Agent Skills/Bonds
            agent_skill_match = re.search(r'(\d+)\s+bonds\s+of\s+(\w+)\s+agent\s+skills\s+learned', cleaned_text, re.IGNORECASE)
            if agent_skill_match:
                count = int(agent_skill_match.group(1))
                bond_type = agent_skill_match.group(2).lower()
                
                if not requirements.get('agent_skills'):
                    requirements['agent_skills'] = {}
                
                requirements['agent_skills'][f'bonds_of_{bond_type}'] = count
                logger.debug(f"      -> Agent Skill {bond_type}: {count}")
                continue
            
            # Check for Mode Change
            if 'mode change' in cleaned_text.lower():
                mode_match = re.search(r'mode\s+change\s+from\s+(.+)', cleaned_text, re.IGNORECASE)
                if mode_match:
                    from_digimon = mode_match.group(1).strip()
                    requirements['paths'].append({
                        "type": "mode_change",
                        "from": from_digimon
                    })
                    logger.debug(f"      -> Mode Change from: {from_digimon}")
                continue
            
            # Check for DNA Digivolution section header or condition
            if 'DNA' in div_text and 'Digivolution' in div_text:
                in_dna_section = True
                logger.debug(f"      -> DNA Digivolution section header")
                continue
            
            # If in DNA section, this should be a "Digimon is Personality" condition
            # Look for the pattern: <Digimon Name> is <Personality>
            if in_dna_section or ('is' in cleaned_text.lower() and not any(keyword in cleaned_text.lower() for keyword in ['mode', 'rank', 'level'])):
                # Extract "Digimon is Personality" pattern
                match = re.match(r'(.+?)\s+is\s+(.+)', cleaned_text, re.IGNORECASE)
                if match:
                    digimon = match.group(1).strip()
                    condition = match.group(2).strip()
                    # Only add if it looks like a valid condition
                    if digimon and condition and len(digimon) > 1 and '.' not in condition:
                        dna_conditions.append({
                            "digimon": digimon,
                            "requirement": condition
                        })
                        logger.debug(f"      -> DNA Condition: {digimon} is {condition}")
                        in_dna_section = True
    
    # Add DNA path if conditions were found
    if dna_conditions:
        requirements['paths'].append({
            "type": "dna",
            "conditions": dna_conditions
        })
        logger.debug(f"    -> Added DNA path with {len(dna_conditions)} conditions")
    
    # Return if any requirements were found
    has_requirements = (
        requirements.get('paths') or
        'agent_rank' in requirements or
        'level' in requirements or
        'stats' in requirements or
        'agent_skills' in requirements
    )
    
    return requirements if has_requirements else None


def _extract_structured_requirements(text: str, digimon_name: str) -> Dict[str, Any]:
    """
    Parse requirement text into structured format.
    
    Handles:
    - General requirements (Agent Rank, Level, Stats like INT/SPD/HP/etc.)
    - DNA Digivolution (multiple Digimon with conditions)
    - Mode Changes
    """
    logger.debug(f"[_extract_structured_requirements] {digimon_name}: Input text={repr(text[:100])}")
    
    requirements = {
        "paths": []
    }
    
    lines = text.split('\n')
    
    # Check if Digimon can no longer evolve
    full_text_lower = text.lower()
    if 'can no longer' in full_text_lower and 'digivolve' in full_text_lower:
        return None
    
    current_path = {}
    in_dna_section = False
    dna_conditions = []
    stats = {}
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if not line:
            i += 1
            continue
        
        # Check for general requirements - handle "Agent Rank X or higher" format
        agent_rank_match = re.search(r'agent\s+rank\s+(\d+)', line, re.IGNORECASE)
        if agent_rank_match:
            requirements['agent_rank'] = int(agent_rank_match.group(1))
        
        # Check for level requirement - handle "Level X or higher" format
        level_match = re.search(r'level\s+(\d+)', line, re.IGNORECASE)
        if level_match:
            requirements['level'] = int(level_match.group(1))
        
        # Check for stat requirements - multiple patterns:
        # Pattern 1: "200+ INT" or "380+ Max SP" or "800+ Max HP"
        # Captures: number + optional (Max/Min) + stat name
        stat_match = re.search(r'(\d+)\+?\s*(?:(Max|Min|Minimum)\s+)?(HP|SP|ATK|DEF|INT|SPI|SPD)(?![a-z])', line, re.IGNORECASE)
        if stat_match:
            value = int(stat_match.group(1))
            stat_qualifier = stat_match.group(2)  # "Max", "Min", or None
            stat_name = stat_match.group(3).upper()
            
            if not requirements.get('stats'):
                requirements['stats'] = {}
            
            # Build the key: "INT", "max_SP", "min_HP", etc.
            if stat_qualifier:
                key = f"{stat_qualifier.lower()}_{stat_name}"
            else:
                key = stat_name
            
            requirements['stats'][key] = value
        
        # Check for Agent Skills/Bonds
        agent_skill_match = re.search(r'(\d+)\s+bonds\s+of\s+(\w+)\s+agent\s+skills\s+learned', line, re.IGNORECASE)
        if agent_skill_match:
            count = int(agent_skill_match.group(1))
            bond_type = agent_skill_match.group(2).lower()
            
            if not requirements.get('agent_skills'):
                requirements['agent_skills'] = {}
            
            requirements['agent_skills'][f'bonds_of_{bond_type}'] = count
        
        # Check for DNA Digivolution section
        if 'DNA' in line and 'Digivolution' in line:
            in_dna_section = True
            dna_conditions = []
            i += 1
            
            # Parse DNA conditions
            while i < len(lines):
                dna_line = lines[i].strip()
                if not dna_line or any(keyword in dna_line for keyword in 
                                       ['DNA', 'Mode', 'Requires', 'Item', 'Quest']):
                    if dna_line and not any(x in dna_line for x in ['DNA']):
                        break
                    i += 1
                    continue
                
                # Extract: "Digimon Name is Condition"
                # e.g., "WarGreymon is Daring"
                match = re.match(r'(.+?)\s+is\s+(.+)', dna_line)
                if match:
                    digimon = match.group(1).strip()
                    condition = match.group(2).strip()
                    dna_conditions.append({
                        "digimon": digimon,
                        "requirement": condition
                    })
                
                i += 1
            
            if dna_conditions:
                requirements['paths'].append({
                    "type": "dna",
                    "conditions": dna_conditions
                })
            continue
        
        # Check for Mode Change
        mode_change_match = re.search(r'mode\s+change\s+from\s+(.+)', line, re.IGNORECASE)
        if mode_change_match:
            from_digimon = mode_change_match.group(1).strip()
            requirements['paths'].append({
                "type": "mode_change",
                "from": from_digimon
            })
        
        i += 1
    
    # Return requirements if any were found
    has_requirements = (
        requirements.get('paths') or
        'agent_rank' in requirements or
        'level' in requirements or
        'stats' in requirements
    )
    
    return requirements if has_requirements else None


def _process_single_digimon(args: Tuple[int, int, str, str]) -> Tuple[str, Optional[Dict[str, Any]]]:
    """
    Process a single Digimon (for parallel execution).
    
    Args:
        args: Tuple of (index, total, digimon_name, url)
        
    Returns:
        Tuple of (digimon_name, requirements)
    """
    idx, total, digimon_name, url = args
    
    logger.info(f"[{idx}/{total}] Processing: {digimon_name}")
    logger.debug(f"   Fetching: {url}")
    
    # Fetch page
    html_content = fetch_page(url)
    if not html_content:
        logger.warning(f"   ✗ Could not fetch page")
        return (digimon_name, None)
    
    # Parse requirements
    requirements = parse_requirements_section(html_content, digimon_name)
    
    if requirements:
        logger.info(f"   ✓ Found requirements: {len(requirements.get('paths', []))} evolution path(s)")
    else:
        logger.info(f"   - No requirements found (may have no evolutions)")
    
    # Small delay to be respectful to the server
    time.sleep(REQUEST_DELAY * 0.5)
    
    return (digimon_name, requirements)


def scrape_digimon_requirements(links_file: str, output_file: str, 
                                start_index: int = 0, limit: Optional[int] = None,
                                workers: int = 1):
    """
    Scrape requirements for all Digimon (with optional parallel processing).
    
    Args:
        links_file: Path to digimon-links.json
        output_file: Path to save requirements
        start_index: Start from this index (for resuming)
        limit: Process only this many Digimon
        workers: Number of parallel workers (default: 1 = sequential)
    """
    # Load links
    logger.info(f"Loading Digimon links from: {links_file}")
    with open(links_file, 'r', encoding='utf-8') as f:
        digimon_links = json.load(f)
    
    total = len(digimon_links)
    logger.info(f"Total Digimon to process: {total}")
    
    items = list(digimon_links.items())
    
    if limit:
        items = items[start_index:start_index + limit]
    else:
        items = items[start_index:]
    
    if workers > 1:
        logger.info(f"Using {workers} parallel workers for faster processing")
    
    # Prepare task arguments
    tasks = [
        (start_index + i + 1, total, digimon_name, url)
        for i, (digimon_name, url) in enumerate(items)
    ]
    
    all_requirements = {}
    
    # Process with thread pool
    with ThreadPoolExecutor(max_workers=workers) as executor:
        # Submit all tasks
        future_to_task = {
            executor.submit(_process_single_digimon, task): task
            for task in tasks
        }
        
        # Collect results as they complete
        completed = 0
        for future in as_completed(future_to_task):
            try:
                digimon_name, requirements = future.result()
                all_requirements[digimon_name] = requirements
                completed += 1
            except Exception as e:
                task = future_to_task[future]
                logger.error(f"Error processing {task[2]}: {e}")
                all_requirements[task[2]] = None
    
    # Save results
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_requirements, f, indent=2, ensure_ascii=False)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"✓ Saved requirements to: {output_file}")
    logger.info(f"  Processed: {len([v for v in all_requirements.values() if v is not None])} with requirements")


def main():
    # Define paths
    project_root = Path(__file__).parent.parent.parent
    links_file = project_root / 'data' / 'processed' / 'digimon-links.json'
    output_file = project_root / 'data' / 'processed' / 'digimon-requirements.json'
    
    logger.info("=" * 60)
    logger.info("STEP 2: Scrape Evolution Requirements")
    logger.info("=" * 60)
    
    if not links_file.exists():
        logger.error(f"Links file not found: {links_file}")
        logger.info("Please run scrape_links.py first")
        return
    
    # You can set limit=10 for testing
    scrape_digimon_requirements(str(links_file), str(output_file), limit=None)


if __name__ == '__main__':
    main()
