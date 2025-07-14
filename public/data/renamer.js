const fs = require('fs');
const path = require('path');

// Normalization logic
function sanitizeFilename(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/_/g, '-')              // Underscore to hyphen
    .toLowerCase();                  // Lowercase
}

const folder = __dirname;

// 1. Rename files in the current folder
fs.readdirSync(folder).forEach(file => {
  const filePath = path.join(folder, file);
  if (fs.statSync(filePath).isFile()) {
    const sanitized = sanitizeFilename(file);
    const newPath = path.join(folder, sanitized);
    if (file !== sanitized) {
      fs.renameSync(filePath, newPath);
      console.log(`✅ Renamed ${file} → ${sanitized}`);
    }
  }
});

// 2. Sanitize image names inside items.json
const jsonPath = path.join(folder, 'items.json');

if (fs.existsSync(jsonPath)) {
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const items = JSON.parse(raw);

    let changed = false;

    items.forEach(item => {
      if (item.image) {
        const sanitized = sanitizeFilename(item.image);
        if (item.image !== sanitized) {
          console.log(`🖼️  Updated image in JSON: ${item.image} → ${sanitized}`);
          item.image = sanitized;
          changed = true;
        }
      }
    });

    if (changed) {
      fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), 'utf8');
      console.log(`✅ items.json updated with sanitized image names.`);
    } else {
      console.log(`ℹ️  No changes needed in items.json.`);
    }

  } catch (err) {
    console.error('❌ Error processing items.json:', err);
  }
} else {
  console.warn('⚠️  items.json not found in this folder.');
}
