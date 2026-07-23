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
    fields: ['uuid', 'title', 'description', 'age', 'gender', 'size', 'imageVertical'],
    transform: (data) => ({
      uuid: data.uuid,
      title: data.title || '',
      description: data.description || '',
      age: data.age || '',
      gender: data.gender || '',
      size: data.size || '',
      imageVertical: data.imageVertical || '',
    })
  },
  {
    name: 'humans',
    subdir: 'humans',
    types: ['volunteers', 'staff'],
    fields: ['uuid', 'title', 'description', 'direction', 'experience', 'imageVertical'],
    transform: (data) => ({
      uuid: data.uuid,
      title: data.title || '',
      description: data.description || '',
      direction: data.direction || '',
      experience: data.experience || '',
      imageVertical: data.imageVertical || '',
    })
  },
  {
    name: 'organizations',
    subdir: 'organizations',
    types: ['shelters'],
    fields: ['uuid', 'title', 'description', 'format', 'imageVertical'],
    transform: (data) => ({
      uuid: data.uuid,
      title: data.title || '',
      description: data.description || '',
      format: data.format || '',
      imageVertical: data.imageVertical || '',
    })
  }
];

// ============================================================
//  3. УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ ПАРСИНГА ДАННЫХ
// ============================================================

function extractData(frontmatter) {
  // Парсим фильтры (если они в виде массива)
  const filter = frontmatter.filter || []
  const ageObj = filter.find(f => f.age)
  const genderObj = filter.find(f => f.gender)
  const sizeObj = filter.find(f => f.size)
  const directionObj = filter.find(f => f.direction)
  const experienceObj = filter.find(f => f.experience)
  const formatObj = filter.find(f => f.format)
  
  // Парсим изображения (если они в виде массива)
  const images = frontmatter.image || []
  const verticalImg = images.find(img => img.vertical)
  const horizontalImg = images.find(img => img.horizontal)
  
  // Возвращаем плоский объект с данными
  // Если поле не найдено в новом формате, берём его как есть (для обратной совместимости)
  return {
    uuid: frontmatter.uuid,
    title: frontmatter.title || '',
    description: frontmatter.description || '',
    // Поля для pets
    age: ageObj?.age || frontmatter.age || '',
    gender: genderObj?.gender || frontmatter.gender || '',
    size: sizeObj?.size || frontmatter.size || '',
    // Поля для humans
    direction: directionObj?.direction || frontmatter.direction || '',
    experience: experienceObj?.experience || frontmatter.experience || '',
    // Поля для organizations
    format: formatObj?.format || frontmatter.format || '',
    // Изображения
    imageVertical: verticalImg?.vertical || frontmatter.imageVertical || '',
    imageHorizontal: horizontalImg?.horizontal || frontmatter.imageHorizontal || '',
  }
}

// ============================================================
//  4. ФУНКЦИЯ ДЛЯ ЧТЕНИЯ ФАЙЛОВ
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
//  5. ФУНКЦИЯ ДЛЯ ГЕНЕРАЦИИ JSON
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

  const fileName = `${contentType.name}-${lang}-${type}.json`;
  const outputPath = path.join(outputDir, fileName);

  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));
  console.log(`✅ Сохранено: ${outputPath} (${items.length} записей)`);
}

// ============================================================
//  6. ГЛАВНАЯ ФУНКЦИЯ
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
//  7. ЗАПУСК
// ============================================================

try {
  generateAll();
} catch (error) {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}