// ==============================
// IMPORTS
// ==============================
const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");

// ==============================
// LOAD HTML FILE
// ==============================
const htmlPath = path.join(
  __dirname,
  "..",   // up from digimon-parser → scripts
  "..",   // up from scripts → project root
  "data",
  "raw",
  "game8",
  "554944.html"
);

const html = fs.readFileSync(htmlPath, "utf-8");
const $ = cheerio.load(html);

// ==============================
// GET 3RD TABLE
// ==============================
const table = $("table").eq(2);

const tableData = [];

table.find("tr").each((i, row) => {
  const cols = [];

  $(row)
    .find("td")
    .each((j, cell) => {
      cols.push($(cell).text().trim());
    });

  if (cols.length === 3) {
    tableData.push(cols);
  }
});

// ==============================
// PARSE CURRENT COLUMN
// ==============================
function parseCurrent(currentStr) {
  // Normalize whitespace: replace newlines and multiple spaces with single space
  const normalized = currentStr.replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^#(\d+)\s+(.+)$/);
  if (!match) return null;

  return {
    id: parseInt(match[1], 10),
    name: match[2].trim()
  };
}

// Build master list
const digimonList = tableData
  .map(row => parseCurrent(row[1]))
  .filter(Boolean);

// Name dictionary
const digimonNames = new Set(digimonList.map(d => d.name));

// ==============================
// PARSE EVOLUTIONS
// ==============================
function parseDigimonString(str, knownNames) {
  if (
    str.includes("cannot be De-Digivolved") ||
    str.includes("can no longer Digivolve")
  ) {
    return [];
  }

  const cleaned = str.replace(/\([^)]+\)/g, ' ').trim();
  const result = [];
  let i = 0;

    while (i < str.length) {
        let match = null;

        // Try to find the longest matching Digimon name
        for (let j = str.length; j > i; j--) {
        const substring = str.slice(i, j).trim();

        if (knownNames.has(substring)) {
            match = substring;
            i = j;
            break;
        }
        }

        if (!match) {
        // If no match found, check if we're at a parenthesis
        // If so, skip that entire (annotation) and continue
        const parenStart = str.indexOf('(', i);
        const parenEnd = str.indexOf(')', parenStart);
        
        if (parenStart === i && parenEnd !== -1) {
            // Skip this parenthetical section
            i = parenEnd + 1;
        } else {
            console.warn("⚠️ Unknown Digimon:", str.slice(i, i + 50));
            break;
        }
        } else {
        result.push(match);
        }
    }

  return result;
}

// ==============================
// EXTRACT ICON (Game8)
// ==============================
function getIcon(cell) {
  const img = cell.find("img");
  if (img.length) {
    return img.attr("data-src") || img.attr("src") || null;
  }
  return null;
}

// Re-read table with DOM access for images
const finalData = [];

table.find("tr").each((i, row) => {
  const cells = $(row).find("td");

  if (cells.length !== 3) return;

  const de = $(cells[0]).text().trim();
  const current = $(cells[1]).text().trim();
  const evo = $(cells[2]).text().trim();

  const parsed = parseCurrent(current);
  if (!parsed) return;

  const icon = getIcon($(cells[1]));

  finalData.push({
    id: parsed.id,
    name: parsed.name,
    pre_evolutions: parseDigimonString(de, digimonNames),
    evolutions: parseDigimonString(evo, digimonNames),
    icon,
    image: null
  });
});

// ==============================
// SAVE TO FILE
// ==============================
const outputDir = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "processed"
);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, "digimon.json");

fs.writeFileSync(
    outputFile,
    JSON.stringify(finalData, null, 2),
    "utf-8"
);

console.log("✅ Done! File saved as digimon.json");