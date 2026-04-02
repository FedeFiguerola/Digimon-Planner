"""
Merge evolution requirements into the main digimon.json dataset.

This script reads the scraped requirements and merges them into the existing
digimon.json file by matching Digimon names.

Input files:
  - /data/processed/digimon.json (original dataset)
  - /data/processed/digimon-requirements.json (scraped requirements)

Output:
  - /data/processed/digimon.json (updated with requirements field)
  - Backup saved as /data/processed/digimon.json.backup
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def normalize_name(name: str) -> str:
    """Normalize Digimon name for matching."""
    return name.strip().lower()


def update_evolution_tree_from_mode_changes(digimon_data: List[Dict[str, Any]]) -> int:
    """
    Update pre_evolutions and evolutions based on mode_change requirements.
    
    For example, if Omnimon has a mode_change from "Omnimon Zwart",
    this adds "Omnimon Zwart" to Omnimon's pre_evolutions (if not already there)
    and adds "Omnimon" to Omnimon Zwart's evolutions (if not already there).
    
    Args:
        digimon_data: List of digimon dictionaries
        
    Returns:
        Number of updates made
    """
    updates = 0
    
    # Create a lookup map for quick name matching
    digimon_map = {normalize_name(d['name']): d for d in digimon_data}
    
    for digimon in digimon_data:
        requirements = digimon.get('requirements')
        if not requirements or 'paths' not in requirements:
            continue
        
        # Process all paths
        for path in requirements['paths']:
            if path.get('type') == 'mode_change':
                source_name = path.get('from')
                if not source_name:
                    continue
                
                target_name = digimon['name']
                
                # Find the source Digimon
                source_normalized = normalize_name(source_name)
                source_digimon = digimon_map.get(source_normalized)
                
                if not source_digimon:
                    logger.debug(f"Could not find mode_change source: {source_name} (for {target_name})")
                    continue
                
                # Update target's pre_evolutions
                if 'pre_evolutions' not in digimon:
                    digimon['pre_evolutions'] = []
                
                if source_digimon['name'] not in digimon['pre_evolutions']:
                    digimon['pre_evolutions'].append(source_digimon['name'])
                    updates += 1
                    logger.debug(f"Added {source_name} to {target_name}'s pre_evolutions (mode_change)")
                
                # Update source's evolutions
                if 'evolutions' not in source_digimon:
                    source_digimon['evolutions'] = []
                
                if target_name not in source_digimon['evolutions']:
                    source_digimon['evolutions'].append(target_name)
                    updates += 1
                    logger.debug(f"Added {target_name} to {source_name}'s evolutions (mode_change)")
    
    return updates


def find_best_match(digimon_name: str, available_names: List[str]) -> Optional[str]:
    """
    Find the best matching Digimon name using fuzzy matching.
    
    Args:
        digimon_name: Target name to match
        available_names: List of available names
        
    Returns:
        Best matching name or None
    """
    normalized_target = normalize_name(digimon_name)
    
    # Exact match
    for name in available_names:
        if normalize_name(name) == normalized_target:
            return name
    
    # Substring match
    for name in available_names:
        if normalized_target in normalize_name(name) or normalize_name(name) in normalized_target:
            return name
    
    return None


def merge_requirements(digimon_file: str, requirements_file: str, 
                       output_file: str, generation_file: Optional[str] = None, backup: bool = True) -> Dict[str, Any]:
    """
    Merge requirements and generation data into digimon dataset.
    
    Args:
        digimon_file: Path to digimon.json
        requirements_file: Path to digimon-requirements.json
        output_file: Path to save updated digimon.json
        generation_file: Optional path to digimon-generation.json
        backup: Create backup of original file
        
    Returns:
        Statistics dict
    """
    logger.info("Loading datasets...")
    
    # Load digimon data
    with open(digimon_file, 'r', encoding='utf-8') as f:
        digimon_data = json.load(f)
    
    # Load requirements
    with open(requirements_file, 'r', encoding='utf-8') as f:
        requirements_data = json.load(f)
    
    # Load generation data if provided
    generation_data = None
    if generation_file and Path(generation_file).exists():
        with open(generation_file, 'r', encoding='utf-8') as f:
            generation_data = json.load(f)
        logger.info(f"Loaded generation data for {len(generation_data)} Digimon")
    
    logger.info(f"Loaded {len(digimon_data)} Digimon")
    logger.info(f"Loaded requirements for {len(requirements_data)} entries")
    
    # Create backup
    if backup:
        backup_file = Path(digimon_file).parent / f"{Path(digimon_file).stem}.json.backup"
        logger.info(f"Creating backup: {backup_file}")
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(digimon_data, f, indent=2, ensure_ascii=False)
    
    # Merge requirements and generation
    stats = {
        "total": len(digimon_data),
        "matched_requirements": 0,
        "unmatched_requirements": 0,
        "with_requirements": 0,
        "without_requirements": 0,
        "matched_generation": 0,
        "unmatched_generation": 0,
        "with_generation": 0,
        "without_generation": 0
    }
    
    available_requirement_names = list(requirements_data.keys()) if requirements_data else []
    available_generation_names = list(generation_data.keys()) if generation_data else []
    
    for digimon in digimon_data:
        digimon_name = digimon['name']
        
        # Try to find matching requirements
        requirements = None
        if available_requirement_names:
            matched_req_name = find_best_match(digimon_name, available_requirement_names)
            if matched_req_name:
                stats['matched_requirements'] += 1
                requirements = requirements_data[matched_req_name]
                if requirements:
                    stats['with_requirements'] += 1
                    logger.debug(f"✓ {digimon_name}: Added requirements")
                else:
                    stats['without_requirements'] += 1
                    logger.debug(f"- {digimon_name}: No requirements found")
            else:
                stats['unmatched_requirements'] += 1
                logger.warning(f"✗ {digimon_name}: No matching requirements found")
        
        # Try to find matching generation
        generation = None
        if available_generation_names:
            matched_gen_name = find_best_match(digimon_name, available_generation_names)
            if matched_gen_name:
                stats['matched_generation'] += 1
                generation = generation_data[matched_gen_name]
                if generation:
                    stats['with_generation'] += 1
                    logger.debug(f"✓ {digimon_name}: Added generation")
                else:
                    stats['without_generation'] += 1
                    logger.debug(f"- {digimon_name}: No generation found")
            else:
                stats['unmatched_generation'] += 1
                logger.warning(f"✗ {digimon_name}: No matching generation found")
        
        # Set the fields
        digimon['requirements'] = requirements
        if generation:
            digimon['generation'] = generation
    
    # Update evolution tree based on mode_change requirements
    logger.info("\nUpdating evolution tree from mode_change requirements...")
    mode_change_updates = update_evolution_tree_from_mode_changes(digimon_data)
    stats['evolution_tree_updates'] = mode_change_updates
    
    if mode_change_updates > 0:
        logger.info(f"✓ Updated evolution tree: {mode_change_updates} changes")
    
    # Save updated data
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(digimon_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"✓ Saved updated dataset to: {output_file}")
    
    return stats


def print_statistics(stats: Dict[str, Any]):
    """Print merge statistics."""
    logger.info("\n" + "="*60)
    logger.info("MERGE STATISTICS")
    logger.info("="*60)
    logger.info(f"Total Digimon:          {stats['total']}")
    logger.info(f"Matched with data:      {stats['matched']} ({stats['matched']/stats['total']*100:.1f}%)")
    logger.info(f"Unmatched:              {stats['unmatched']} ({stats['unmatched']/stats['total']*100:.1f}%)")
    logger.info(f"  - With requirements:  {stats['with_requirements']}")
    logger.info(f"  - Without:            {stats['without_requirements']}")
    if 'evolution_tree_updates' in stats:
        logger.info(f"\nEvolution Tree Updates: {stats['evolution_tree_updates']} changes")
        logger.info("  (from mode_change requirements)")
    logger.info("="*60)


def verify_merge(output_file: str, sample_count: int = 3):
    """Verify the merge was successful by checking a sample."""
    logger.info(f"\nVerifying merge (sampling {sample_count} entries)...")
    
    with open(output_file, 'r', encoding='utf-8') as f:
        digimon_data = json.load(f)
    
    # Find entries with requirements
    with_requirements = [d for d in digimon_data if d.get('requirements') is not None]
    
    if with_requirements:
        logger.info(f"\nSample entries WITH requirements:")
        for digimon in with_requirements[:sample_count]:
            logger.info(f"\n  {digimon['name']}:")
            reqs = digimon.get('requirements', {})
            if 'agent_rank' in reqs:
                logger.info(f"    - Agent Rank: {reqs['agent_rank']}")
            if 'level' in reqs:
                logger.info(f"    - Level: {reqs['level']}")
            if reqs.get('paths'):
                logger.info(f"    - Evolution paths: {len(reqs['paths'])}")
                for path in reqs['paths']:
                    path_type = path.get('type', 'unknown')
                    if path_type == 'mode_change':
                        logger.info(f"      • {path_type}: from {path.get('from')}")
                    else:
                        logger.info(f"      • {path_type}")
            if digimon.get('pre_evolutions'):
                logger.info(f"    - Pre-evolutions: {', '.join(digimon['pre_evolutions'])}")
            if digimon.get('evolutions'):
                logger.info(f"    - Evolutions: {', '.join(digimon['evolutions'])}")
    
    without_requirements = [d for d in digimon_data if d.get('requirements') is None]
    if without_requirements:
        logger.info(f"\nSample entries WITHOUT requirements:")
        for digimon in without_requirements[:sample_count]:
            logger.info(f"  - {digimon['name']}")


def main():
    # Define paths
    project_root = Path(__file__).parent.parent.parent
    digimon_file = project_root / 'data' / 'processed' / 'digimon.json'
    requirements_file = project_root / 'data' / 'processed' / 'digimon-requirements.json'
    output_file = project_root / 'data' / 'processed' / 'digimon.json'
    
    logger.info("=" * 60)
    logger.info("STEP 4: Merge Requirements into digimon.json")
    logger.info("=" * 60)
    
    # Check files exist
    if not digimon_file.exists():
        logger.error(f"Digimon file not found: {digimon_file}")
        return
    
    if not requirements_file.exists():
        logger.error(f"Requirements file not found: {requirements_file}")
        logger.info("Please run scrape_requirements.py first")
        return
    
    # Merge
    stats = merge_requirements(str(digimon_file), str(requirements_file), str(output_file))
    
    # Print statistics
    print_statistics(stats)
    
    # Verify
    verify_merge(str(output_file), sample_count=3)
    
    logger.info("\n✓ Merge complete!")


if __name__ == '__main__':
    main()
