import { useTranslate, useAge, useAgePetCategory, useDirection, useExperience } from './useTranslate'
export const useConfigItem = {
  humans: {
    name: 'humans',
    label: 'Волонтёры',
    basePath: 'humans',
    dataFile: (lang, type) => `humans-${lang}-${type}.json`,
    linkPath: (item) => `/humans/${item.covenantID ? item.covenantID + '/' : ''}`,
    fields: {
      display: ['directionDisplay', 'experienceDisplay'],
      filter: ['direction', 'experience'],
      connect: ['shelters']
    },
    filters: {
      experience: { keys: ['Начинающий', 'Опытный', 'Эксперт'], label: 'Опыт' },
      direction: { keys: ['Выгул', 'Социализация', 'Лечение', 'Передержка', 'Креатив', 'Фандрайзинг'], label: 'Направление' }
    },
    icons: {
      experience: { 'Начинающий': 'begin', 'Опытный': 'versed', 'Эксперт': 'expert' },
      direction: { 'Выгул': 'walk', 'Социализация': 'social', 'Лечение': 'treatment', 'Передержка': 'foster', 'Креатив': 'creative', 'Фандрайзинг': 'fundraising' }
    },
    transform: (item, lang, translate) => ({
      nameDisplay: item.title || '',
      descriptionDisplay: item.description || '',
      direction: useDirection('ru', item.direction),
      directionDisplay: useDirection(lang, item.direction),
      experience: useExperience('ru', item.experience),
      experienceDisplay: useExperience(lang, item.experience),
      shelters: item.shelters || [],
    })
  },
  organizations: {
    name: 'organizations',
    label: 'Организации',
    basePath: 'organizations',
    dataFile: (lang, type) => `organizations-${lang}-${type}.json`,
    linkPath: (item) => `/organizations/${item.covenantID ? item.covenantID + '/' : ''}`,
    fields: {
      display: ['formatDisplay'],
      filter: ['format'],
      connect: []
    },
    filters: {
      format: { keys: ['Частный', 'Государственный'], label: 'Формат' }
    },
    icons: {
      format: { 'Государственный': 'state', 'Частный': 'private' }
    },
    transform: (item, lang, translate) => ({
      nameDisplay: item.title || '',
      descriptionDisplay: item.description || '',
      format: useTranslate('ru', 'format', item.format),
      formatDisplay: useTranslate(lang, 'format', item.format),
    })
  },
  pets: {
    name: 'pets',
    label: 'Питомцы',
    basePath: 'pets',
    dataFile: (lang, type) => `pets-${lang}-${type}.json`,
    linkPath: (item) => `/pets/${item.covenantID ? item.covenantID + '/' : ''}`,
    fields: {
      display: ['genderDisplay', 'ageDisplay', 'sizeDisplay'],
      filter: ['gender', 'age', 'size'],
      connect: ['shelters', 'volunteers']
    },
    filters: {
      gender: { keys: ['Девочка', 'Мальчик'], label: 'Пол' },
      age: { keys: ['Детеныш', 'Молодая', 'Взрослая'], label: 'Возраст' },
      size: { keys: ['Маленькая', 'Средняя', 'Крупная'], label: 'Размер' }
    },
    icons: {
      gender: { 'Девочка': 'woman', 'Мальчик': 'man' },
      age: { 'Детеныш': 'young', 'Молодая': 'middle', 'Взрослая': 'old' },
      size: { 'Маленькая': 'small', 'Средняя': 'medium', 'Крупная': 'large' }
    },
    transform: (item, lang, translate) => ({
      nameDisplay: item.title || '',
      descriptionDisplay: item.description || '',
      gender: useTranslate('ru', 'gender', item.gender),
      genderDisplay: useTranslate(lang, 'gender', item.gender),
      age: useAgePetCategory(item.age),
      ageDisplay: useAge(lang, item.age),
      size: item.size || '',
      sizeDisplay: useTranslate(lang, 'size', item.size),
      shelters: item.shelters || [],
      volunteers: item.volunteers || [],
    })
  }
}