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
    fields: ['uuid', 'title', 'description', 'age', 'gender', 'size', 'imageVertical', 'covenantID', 'covenantType', 'shelters', 'volunteers'],
    transform: (data) => ({
      uuid: data.uuid,
      title: data.title || '',
      description: data.description || '',
      age: data.age || '',
      gender: data.gender || '',
      size: data.size || '',
      covenantID: data.covenantID || '',
      covenantType: data.covenantType || '',
      imageVertical: data.imageVertical || '',
      shelters: data.shelters || [],
      volunteers: data.volunteers || [],
    })
  },
  {
    name: 'humans',
    subdir: 'humans',
    types: ['volunteers'],
    fields: ['uuid', 'title', 'description', 'direction', 'experience', 'covenantID', 'covenantType', 'imageVertical', 'shelters'],
    transform: (data) => ({
      uuid: data.uuid,
      title: data.title || '',
      description: data.description || '',
      direction: data.direction || '',
      experience: data.experience || '',
      covenantID: data.covenantID || '',
      covenantType: data.covenantType || '',
      imageVertical: data.imageVertical || '',
      shelters: data.shelters || [],
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
//  3. ПАРСИНГ ДАННЫХ
// ============================================================

function extractData(frontmatter) {
  // Фильтры
  const filter = frontmatter.filter || []
  const ageObj = filter.find(f => f.age)
  const genderObj = filter.find(f => f.gender)
  const sizeObj = filter.find(f => f.size)
  const directionObj = filter.find(f => f.direction)
  const experienceObj = filter.find(f => f.experience)
  const formatObj = filter.find(f => f.format)
  
  // Изображения
  const images = frontmatter.image || []
  const verticalImg = images.find(img => img.vertical)
  const horizontalImg = images.find(img => img.horizontal)
  
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
    // Завет
    covenantID: frontmatter.covenantID || '',
    covenantType: frontmatter.covenantType || '',
    // Изображения
    imageVertical: verticalImg?.vertical || frontmatter.imageVertical || '',
    imageHorizontal: horizontalImg?.horizontal || frontmatter.imageHorizontal || '',
    // Группировка
    shelters: frontmatter.shelters || [],
    volunteers: frontmatter.volunteers || [],
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
  
  // 1. Данные проекта
  const myDir = path.join(rootDir, lang, contentType.subdir, type);
  if (fs.existsSync(myDir)) {
    console.log(`📂 Твои данные: ${myDir}`);
    const myItems = getItemsFromDir(myDir, contentType.transform);
    items.push(...myItems);
  }
  
  // 2. Данные волонтеров (сабмодули в humans)
  const volunteersDir = path.join(rootDir, lang, 'humans');
  if (fs.existsSync(volunteersDir)) {
    const volunteers = fs.readdirSync(volunteersDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory());
    
    for (const volunteer of volunteers) {
      const volunteerDir = path.join(volunteersDir, volunteer.name, contentType.subdir, type);
      if (fs.existsSync(volunteerDir)) {
        console.log(`📂 Волонтер ${volunteer.name}: ${volunteerDir}`);
        const volunteerItems = getItemsFromDir(volunteerDir, contentType.transform);
        const itemsWithVolunteer = volunteerItems.map(item => ({
          ...item,
          covenantID: volunteer.name,
          covenantType: 'humans',
        }));
        items.push(...itemsWithVolunteer);
      }
    }
  }

  // 2. Данные приютов (сабмодули в organizations)
  const sheltersDir = path.join(rootDir, lang, 'organizations');
  if (fs.existsSync(sheltersDir)) {
    const shelters = fs.readdirSync(sheltersDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory());
    
    for (const shelter of shelters) {
      const shelterDir = path.join(sheltersDir, shelter.name, contentType.subdir, type);
      if (fs.existsSync(shelterDir)) {
        console.log(`📂 Приют ${shelter.name}: ${shelterDir}`);
        const shelterItems = getItemsFromDir(shelterDir, contentType.transform);
        const itemsWithShelter = shelterItems.map(item => ({
          ...item,
          covenantID: shelter.name,
          covenantType: 'organizations',
        }));
        items.push(...itemsWithShelter);
      }
    }
  }
  
  return items;
}

// ============================================================
//  6. ГЕНЕРАЦИИ JSON
// ============================================================

function generateJson(lang, contentType, type) {
  console.log(`📂 Обработка: ${lang}/${contentType.name}/${type}`);

  const items = getAllItems(lang, contentType, type);
  
  if (items.length === 0) {
  console.log(`⚠️ Нет данных для ${lang}/${contentType.name}/${type}, создаём пустой JSON`);
  // Создаём пустой JSON
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const fileName = `${contentType.name}-${lang}-${type}.json`;
  const outputPath = path.join(outputDir, fileName);
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
  console.log(`✅ Создан пустой JSON: ${outputPath}`);
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
//  7. ГЛАВНАЯ ФУНКЦИЯ
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
//  8. ЗАПУСК
// ============================================================

try {
  generateAll();
} catch (error) {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}