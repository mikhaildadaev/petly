const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ============================================================
//  1. НАСТРОЙКИ
// ============================================================

const languages = ['ru', 'en', 'de'];
const rootDir = './';
const outputDir = './public/data';

// ============================================================
//  2. КОНФИГУРАЦИЯ
// ============================================================

const contentTypes = [
  {
    name: 'pets',
    subdir: 'pets',
    types: ['cats', 'dogs'],
    fields: ['uuid', 'title', 'description', 'age', 'gender', 'size', 'imageVertical', 'imageHorizontal', 'covenantID', 'shelters', 'volunteers'],
    transform: (data) => {
      const filter = []
      if (data.age) filter.push({ age: data.age })
      if (data.gender) filter.push({ gender: data.gender })
      if (data.size) filter.push({ size: data.size })
      return {
        uuid: data.uuid,
        title: data.title || '',
        description: data.description || '',
        filter: filter,
        imageVertical: data.imageVertical || '',
        imageHorizontal: data.imageHorizontal || '',
        shelters: data.shelters || [],
        volunteers: data.volunteers || [],
        covenantID: data.covenantID || '',
      }
    }
  },
  {
    name: 'humans',
    subdir: 'humans',
    types: ['volunteers'],
    fields: ['uuid', 'title', 'description', 'direction', 'experience', 'imageVertical', 'imageHorizontal', 'covenantID', 'shelters'],
    transform: (data) => {
      const filter = []
      if (data.direction) filter.push({ direction: data.direction })
      if (data.experience) filter.push({ experience: data.experience })
      return {
        uuid: data.uuid,
        title: data.title || '',
        description: data.description || '',
        filter: filter,
        imageVertical: data.imageVertical || '',
        imageHorizontal: data.imageHorizontal || '',
        shelters: data.shelters || [],
        covenantID: data.covenantID || '',
      }
    }
  },
  {
    name: 'organizations',
    subdir: 'organizations',
    types: ['shelters'],
    fields: ['uuid', 'title', 'description', 'format', 'imageVertical', 'imageHorizontal', 'covenantID'],
    transform: (data) => {
      const filter = []
      if (data.format) filter.push({ format: data.format })
      return {
        uuid: data.uuid,
        title: data.title || '',
        description: data.description || '',
        filter: filter,
        imageVertical: data.imageVertical || '',
        imageHorizontal: data.imageHorizontal || '',
        covenantID: data.covenantID || '',
      }
    }
  }
];

// ============================================================
//  3. ПАРСИНГ ДАННЫХ
// ============================================================

function extractData(frontmatter) {
  const filter = frontmatter.filter || []
  const ageObj = filter.find(f => f.age)
  const genderObj = filter.find(f => f.gender)
  const sizeObj = filter.find(f => f.size)
  const directionObj = filter.find(f => f.direction)
  const experienceObj = filter.find(f => f.experience)
  const formatObj = filter.find(f => f.format)
  const images = frontmatter.image || []
  const verticalImg = images.find(img => img.vertical)
  const horizontalImg = images.find(img => img.horizontal)
  return {
    uuid: frontmatter.uuid,
    title: frontmatter.title || '',
    description: frontmatter.description || '',
    age: ageObj?.age || frontmatter.age || '',
    gender: genderObj?.gender || frontmatter.gender || '',
    size: sizeObj?.size || frontmatter.size || '',
    direction: directionObj?.direction || frontmatter.direction || '',
    experience: experienceObj?.experience || frontmatter.experience || '',
    format: formatObj?.format || frontmatter.format || '',
    imageVertical: verticalImg?.vertical || frontmatter.imageVertical || '',
    imageHorizontal: horizontalImg?.horizontal || frontmatter.imageHorizontal || '',
    shelters: frontmatter.shelters || [],
    volunteers: frontmatter.volunteers || [],
    covenantID: frontmatter.covenantID || '',
  }
}

// ============================================================
//  4. ЧТЕНИЯ ФАЙЛОВ ИЗ ПАПКИ
// ============================================================

function getItemsFromDir(dir, transformFn) {
  const items = [];
  if (!fs.existsSync(dir)) {
    console.log(`⚠️ Папка не найдена: ${dir}`);
    return items;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subItems = getItemsFromDir(fullPath, transformFn);
      items.push(...subItems);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { data: frontmatter } = matter(content);
        if (!frontmatter.uuid) {
          console.log(`⚠️ Пропущен файл без uuid: ${fullPath}`);
          continue;
        }
        const flatData = extractData(frontmatter);
        items.push(transformFn(flatData));
      } catch (error) {
        console.error(`❌ Ошибка чтения файла ${fullPath}:`, error.message);
      }
    }
  }
  return items;
}

// ============================================================
//  5. СБОР ДАННЫХ
// ============================================================

function getAllItems(lang, contentType, type) {
  const items = [];
  const langDir = path.join(rootDir, lang);
  let baseDir;
  switch (contentType.name) {
    case 'humans':
      baseDir = path.join(langDir, 'humans');
      break;
    case 'organizations':
      baseDir = path.join(langDir, 'organizations');
      break;
    case 'pets':
      baseDir = path.join(langDir, 'pets');
      break;
    default:
      console.log(`⚠️ Неизвестный тип контента: ${contentType.name}`);
      return items;
  }
  if (!fs.existsSync(baseDir)) {
    console.log(`⚠️ Папка не найдена: ${baseDir}`);
    return items;
  }
  function walkDir(dir, depth = 0) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === type) {
          const dirItems = getItemsFromDir(fullPath, contentType.transform);
          const parentName = path.basename(dir);
          const isSystem = parentName === 'humans' || parentName === 'organizations' || parentName === 'pets';
          const itemsWithMeta = dirItems.map(item => ({
            ...item,
            covenantID: isSystem ? '' : parentName,
          }));
          items.push(...itemsWithMeta);
        } else {
          walkDir(fullPath, depth + 1);
        }
      }
    }
  }
  walkDir(baseDir);
  return items;
}

// ============================================================
//  6. ГЕНЕРАЦИИ JSON
// ============================================================

function generateJson(lang, contentType, type) {
  const items = getAllItems(lang, contentType, type);
  if (items.length === 0) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const fileName = `${contentType.name}-${lang}-${type}.json`;
    const outputPath = path.join(outputDir, fileName);
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    console.log(`Сгенерирован: ${outputPath} (0 записей)`);
    return;
  }
  // Сортировка по UUIDv7 (по убыванию)
  items.sort((a, b) => {
    if (a.uuid > b.uuid) return -1;
    if (a.uuid < b.uuid) return 1;
    return 0;
  });
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const fileName = `${contentType.name}-${lang}-${type}.json`;
  const outputPath = path.join(outputDir, fileName);
  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));
  console.log(`Сгенерирован: ${outputPath} (${items.length} записей)`);
}

// ============================================================
//  7. ГЛАВНАЯ ФУНКЦИЯ
// ============================================================

function generateAll() {
  console.log('Генерацию JSON файлов...');
  let totalFiles = 0;
  for (const lang of languages) {
    for (const contentType of contentTypes) {
      for (const type of contentType.types) {
        generateJson(lang, contentType, type);
        totalFiles++;
      }
    }
  }
  console.log(`✅ Сгенерировано ${totalFiles} JSON файлов.`);
}

// ============================================================
//  8. ЗАПУСК
// ============================================================

try {
  generateAll();
} catch (error) {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}