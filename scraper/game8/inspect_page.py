from bs4 import BeautifulSoup
from pathlib import Path

# load local html file
file_path = Path("data/raw/game8/554944.html")

html = file_path.read_text(encoding="utf-8")
soup = BeautifulSoup(html, "lxml")

print("Page loaded successfully")

tables = soup.find_all("table")

print(f"Found {len(tables)} tables")

# explore all tables in the html and print their contents
# print table rows as list of cell values
for i, table in enumerate(tables):
    print(f"\nTable {i + 1}:")
    rows = table.find_all("tr")
    for j, row in enumerate(rows):
        cells = row.find_all(["td", "th"])
        cell_values = [cell.get_text(strip=True) for cell in cells]
        print(f"  Row {j + 1}: {cell_values}")