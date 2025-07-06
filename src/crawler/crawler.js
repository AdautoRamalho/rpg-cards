const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchCharacterJSON(id, cookieString) {
  const url = `https://www.dndbeyond.com/character/${id}/json`;
  try {
    const res = await axios.get(url, {
      headers: {
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0'
      }
    });
    return res.data;
  } catch (e) {
    console.error(`❌ Error fetching character ${id}: ${e.message}`);
    return null;
  }
}

function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

function simplifyCharacter(data) {
  const statsMap = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
  const simplified = {
    name: data.name,
    attributes: {},
    skills: {},
    inventory: [],
    spells: []
  };

  // Attributes
  data.stats.forEach(stat => {
    simplified.attributes[statsMap[stat.id - 1]] = {
      value: stat.value,
      modifier: getModifier(stat.value)
    };
  });

  // Skills
  const skillModifiers = [
    ...data.modifiers.race,
    ...data.modifiers.class,
    ...data.modifiers.background,
    ...data.modifiers.feat
  ];

  skillModifiers
    .filter(mod => mod.type === 'proficiency' && mod.subType === 'skill')
    .forEach(skill => {
      simplified.skills[skill.friendlySubtypeName] = {
        proficiencyBonus: skill.value || data.preferences.proficiencyBonus
      };
    });

  // Inventory
  data.inventory.forEach(item => {
    simplified.inventory.push({
      name: item.definition.name,
      type: item.definition.filterType,
      quantity: item.quantity,
      equipped: item.equipped,
      attuned: item.isAttuned,
      description: item.definition.description
    });
  });

  // Spells
  data.classSpells.forEach(cls => {
    cls.spells.forEach(spell => {
      simplified.spells.push({
        name: spell.definition.name,
        level: spell.definition.level,
        school: spell.definition.school,
        castingTime: spell.definition.activation?.activationTime,
        range: spell.definition.range?.rangeValue,
        components: spell.definition.components || [],
        description: spell.definition.description || '',
        duration: spell.definition.duration || 'Instantaneous',
        materials: spell.definition.materials || '',
        ritual: spell.definition.ritual || false
      });
    });
  });

  return simplified;
}

// ✅ Character IDs and output folder
const characterIds = [
  '128222546', // Turquesa
  '138255353', // Zirael
  '138395054', // Zaratustra
  '135454228', // BigBob
  '128386640'  // Bastian
];

const outputDir = path.join(__dirname, 'characters');

(async () => {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const cookies = JSON.parse(fs.readFileSync('./cookies.json'));
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  for (const charId of characterIds) {
    console.log(`⏳ Fetching character ${charId}...`);
    const data = await fetchCharacterJSON(charId, cookieString);
    if (!data) continue;

    const simplified = simplifyCharacter(data);
    const outputPath = path.join(outputDir, `${simplified.name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(simplified, null, 2));
    console.log(`✅ Saved ${simplified.name} to ${outputPath}`);
  }
})();
