const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data/processed/digimon.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const slugify = (name) => {
  return name
    .toLowerCase()
    .replace(/\+/g, '-plus-')
    .replace(/[()]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const baseUrl = 'https://www.grindosaur.com/img/games/digimon-story-time-stranger/digimon/';

data.forEach((digimon) => {
  const slug = slugify(digimon.name);
  digimon.image = `${baseUrl}${slug}-stats-overview.jpg`;
  console.log(`✓ ${digimon.name} → ${slug}`);
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`\n✓ Updated ${data.length} digimons`);
