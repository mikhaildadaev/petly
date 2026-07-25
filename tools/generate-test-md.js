const fs = require('fs');
const path = require('path');

// ============================================================
//  1. НАСТРОЙКИ
// ============================================================

const COUNT = 1000;
const OUTPUT_DIR = './ru/pets/019f755e-a23d-730c-aab9-b5efbf207703/dogs';

// ============================================================
//  2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

// Генерация UUIDv7 (сортировка по времени)
function generateUUIDv7() {
  const timestamp = Date.now().toString(16).padStart(12, '0');
  const random = Math.random().toString(16).slice(2, 16).padEnd(14, '0');
  return `019f4222-${timestamp.slice(0, 8)}-${timestamp.slice(8, 12)}-${random.slice(0, 4)}-${random.slice(4, 16)}`;
}

// Случайный выбор из массива
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Случайная дата за последние 5 лет
function randomDate() {
  const now = new Date();
  const yearsAgo = Math.floor(Math.random() * 5);
  const monthsAgo = Math.floor(Math.random() * 12);
  const daysAgo = Math.floor(Math.random() * 28);
  const date = new Date(now.getFullYear() - yearsAgo, now.getMonth() - monthsAgo, now.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// ============================================================
//  3. ДАННЫЕ ДЛЯ ГЕНЕРАЦИИ
// ============================================================

const NAMES = {
  male: ['Рекс', 'Барсик', 'Шарик', 'Бобик', 'Дружок', 'Макс', 'Лорд', 'Джек', 'Тоша', 'Граф', 'Оскар', 'Тайсон'],
  female: ['Жужа', 'Лада', 'Альма', 'Герда', 'Дина', 'Милка', 'Нора', 'Соня', 'Белка', 'Стрелка', 'Лайма', 'Дейзи']
};

const GENDERS = ['Мальчик', 'Девочка'];
const SIZES = ['Маленькая', 'Средняя', 'Крупная'];

const DESCRIPTIONS = [
  'Душа компании. Очень дружелюбный и активный питомец.',
  'Спокойный и уравновешенный. Любит долгие прогулки.',
  'Игривый и весёлый. Отлично ладит с детьми и другими животными.',
  'Преданный и верный друг. Любит внимание и ласку.',
  'Самостоятельный и умный. Быстро учится новым командам.',
  'Нежный и ласковый. Идеальный компаньон для дома.',
  'Энергичный и любознательный. Всегда в движении.',
  'Спокойный и послушный. Хорошо подходит для пожилых людей.'
];

const SHELTERS = [
  '019f755e-a23d-730c-aab9-b5efbf207703',
];

const VOLUNTEERS = [
  '019f4221-be66-7099-98ef-4b0a59e3d5da',
  '019f4221-be66-7099-98ef-4b0a59e3d5dd',
  '019f4221-be66-7099-98ef-4b0a59e3d5df',
];

// ============================================================
//  4. ГЕНЕРАЦИЯ ОДНОГО ФАЙЛА
// ============================================================

function generatePet(index) {
  const gender = randomPick(GENDERS);
  const name = randomPick(gender === 'Мальчик' ? NAMES.male : NAMES.female);
  const uuid = generateUUIDv7();
  
  // Чтобы имена не повторялись
  const uniqueName = `${name} ${Math.floor(Math.random() * 100)}`;
  
  return {
    uuid,
    title: uniqueName,
    description: randomPick(DESCRIPTIONS),
    age: randomDate(),
    gender,
    size: randomPick(SIZES),
    shelters: [randomPick(SHELTERS)],
    volunteers: [randomPick(VOLUNTEERS)],
    imageHorizontal: '/assets/webp/card_horizontal_dog.webp',
    imageVertical: '/assets/webp/card_vertical_dog.webp',
    photos: [
      '/assets/webp/gallery_horizontal_dog.webp',
      '/assets/webp/gallery_vertical_dog.webp'
    ],
    videos: ['https://yastatic.net/s3/promohr/cdn/promo-young-con/2026/yc26_v01.mp4'],
  };
}

// ============================================================
//  5. ФОРМАТИРОВАНИЕ В MARKDOWN
// ============================================================

function formatMarkdown(pet) {
  return `---
uuid: '${pet.uuid}'
title: '${pet.title}'
description: '${pet.description}'
filter:
  - age: '${pet.age}'
  - gender: '${pet.gender}'
  - size: '${pet.size}'
image:
  - horizontal: '${pet.imageHorizontal}'
  - vertical: '${pet.imageVertical}'
shelters:
  - '${pet.shelters[0]}'
volunteers:
  - '${pet.volunteers[0]}'
audios:
photos:
  - '${pet.photos[0]}'
  - '${pet.photos[1]}'
videos:
  - '${pet.videos[0]}'
---

# Питомец
<div class="uuid">${pet.uuid}</div>
<CardHero :type="'dogs'"/>

## Характер

- **Особенности:** ${pet.title} — ${pet.description}
- **С другими собаками:** Дружелюбно относится к сородичам.
- **С людьми:** Преданный и ласковый друг.
- **На прогулке:** Любит долгие прогулки на свежем воздухе.

## Медиатека
<GalleryMedia :audios="$frontmatter.audios" :photos="$frontmatter.photos" :videos="$frontmatter.videos"/>

## История

${pet.title} — это замечательный питомец, который ищет свой дом. Он попал в приют в ${new Date(pet.age).toLocaleDateString('ru-RU')}. Сейчас ему нужна любящая семья.

> «Каждый питомец заслуживает дом, а каждый человек может стать частью доброго дела.»

Если вы ищете верного друга — ${pet.title} станет отличным выбором!

## Опекуны
<ItemsSelect :type="'humans'" :item-type="'volunteers'" :uuids="$frontmatter.volunteers || []"/>

## Приют

<ItemsSelect :type="'organizations'" item-:type="'shelters'" :uuids="$frontmatter.shelters || []"/>
<StyleImagePage src="/assets/webp/dogWithGirlPhoto.webp" width="320px" float="center"/>
`;
}

// ============================================================
//  6. ГЛАВНАЯ ФУНКЦИЯ
// ============================================================

function generateAll() {
  // Создаём папку, если её нет
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`🚀 Генерация ${COUNT} тестовых питомцев...`);
  
  for (let i = 0; i < COUNT; i++) {
    const pet = generatePet(i);
    const fileName = `${pet.uuid}.md`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    const content = formatMarkdown(pet);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    
    if (i % 100 === 0) {
      console.log(`✅ Сгенерировано ${i + 1} из ${COUNT}`);
    }
  }
  
  console.log(`✅ Готово! Создано ${COUNT} файлов в ${OUTPUT_DIR}`);
}

// ============================================================
//  7. ЗАПУСК
// ============================================================

try {
  generateAll();
} catch (error) {
  console.error('❌ Ошибка:', error);
}