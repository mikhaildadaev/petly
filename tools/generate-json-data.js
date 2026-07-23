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
//  2. КОНФИГУРАЦИЯ ТИПОВ КОНТЕНТА
// ============================================================

const contentTypes = [
  {
    name: 'pets',
    subdir: 'pets',
    types: ['cats', 'dogs'],
    fields: ['uuid', 'title', 'description', 'age', 'gender', 'size', 'imageHorizontal', 'imageVertical', 'shelters', 'volunteers', 'photos', 'videos', 'audios'],
    transform: (data) => ({
      uuid: data.uuid,
      title: data.title || '',
      description: data.description || '',
      age: data.age || '',
      gender: data.gender || '',
      size: data.size || '',
      imageHorizontal: data.imageHorizontal || '',
      imageVertical: data.imageVertical || '',
      shelters: data.shelters || [],
      volunteers: data.volunteers || [],
      photos: data.photos || [],
      videos: data.videos || [],
      audios: data.audios || [],
    })
  },
  {
    name: 'humans',
    subdir: 'humans',
    types: ['volunteers', 'staff'],
    fields: ['uuid', 'title', 'description', 'direction', 'experience', 'imageHorizontal', 'imageVertical', 'shelters'],
    transform: (data) => ({
      uuid: data.uuid,
      title: data.title || '',
      description: data.description || '',
      direction: data.direction || '',
      experience: data.experience || '',
      imageHorizontal: data.imageHorizontal || '',
      imageVertical: data.imageVertical || '',
      shelters: data.shelters || [],
    })
  },
  {
    name: 'organizations',
    subdir: 'organizations',
    types: ['shelters'],
    fields: ['uuid', 'title', 'description', 'format', 'address', 'mode', 'telephone', 'imageHorizontal', 'imageVertical', 'photos', 'videos', 'audios', 'repositories'],
    transform: (data) => ({
      uuid: data.uuid,
      title: data.title || '',
      description: data.description || '',
      format: data.format || '',
      address: data.address || '',
      mode: data.mode || '',
      telephone: data.telephone || '',
      imageHorizontal: data.imageHorizontal || '',
      imageVertical: data.imageVertical || '',
      photos: data.photos || [],
      videos: data.videos || [],
      audios: data.audios || [],
      repositories: data.repositories || [],
    })
  }
];

// ============================================================
//  3. ФУНКЦИЯ ДЛЯ ЧТЕНИЯ ФАЙЛОВ
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

        items.push(transformFn(frontmatter));
      } catch (error) {
        console.error(`❌ Ошибка чтения файла ${fullPath}:`, error.message);
      }
    }
  }

  return items;
}

// ============================================================
//  4. ФУНКЦИЯ ДЛЯ ГЕНЕРАЦИИ JSON
// ============================================================

function generateJson(lang, contentType, type) {
  const dir = path.join(rootDir, lang, contentType.subdir, type);
  console.log(`📂 Обработка: ${lang}/${contentType.name}/${type} → ${dir}`);

  const items = getItemsFromDir(dir, contentType.transform);
  
  if (items.length === 0) {
    console.log(`⚠️ Нет данных для ${lang}/${contentType.name}/${type}`);
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Имя файла: data-pets-ru-dogs.json, data-humans-ru-volunteers.json и т.д.
  const fileName = `${contentType.name}-${lang}-${type}.json`;
  const outputPath = path.join(outputDir, fileName);

  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));
  console.log(`✅ Сохранено: ${outputPath} (${items.length} записей)`);
}

// ============================================================
//  5. ГЛАВНАЯ ФУНКЦИЯ
// ============================================================

function generateAll() {
  console.log('🚀 Начинаем генерацию JSON файлов...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalFiles = 0;

  for (const lang of languages) {
    for (const contentType of contentTypes) {
      for (const type of contentType.types) {
        generateJson(lang, contentType, type);
        totalFiles++;
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Генерация завершена! Создано ${totalFiles} JSON файлов.`);
}

// ============================================================
//  6. ЗАПУСК
// ============================================================

try {
  generateAll();
} catch (error) {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}