import { useTranslate, useAge, useAgePetCategory, useDirection, useExperience } from './useTranslate'

const getFilterValue = (filter, key) => {
  if (!filter || !Array.isArray(filter)) return ''
  const found = filter.find(f => f[key] !== undefined)
  return found ? found[key] : ''
}

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
    transform: (item, lang, translate) => {
      const filter = item.filter || []
      const direction = getFilterValue(filter, 'direction')
      const experience = getFilterValue(filter, 'experience')
      return {
        nameDisplay: item.title || '',
        descriptionDisplay: item.description || '',
        direction: useDirection('ru', direction),
        directionDisplay: useDirection(lang, direction),
        experience: useExperience('ru', experience),
        experienceDisplay: useExperience(lang, experience),
        shelters: item.shelters || [],
      }
    }
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
    transform: (item, lang, translate) => {
      const filter = item.filter || []
      const format = getFilterValue(filter, 'format')
      return {
        nameDisplay: item.title || '',
        descriptionDisplay: item.description || '',
        format: useTranslate('ru', 'format', format),
        formatDisplay: useTranslate(lang, 'format', format),
      }
    }
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
    transform: (item, lang, translate) => {
      const filter = item.filter || []
      const age = getFilterValue(filter, 'age')
      const gender = getFilterValue(filter, 'gender')
      const size = getFilterValue(filter, 'size')
      return {
        nameDisplay: item.title || '',
        descriptionDisplay: item.description || '',
        gender: gender || '',
        genderDisplay: gender ? translate('gender', gender) : '',
        age: age ? useAgePetCategory(age) : '',
        ageDisplay: age ? useAge(lang, age) : '',
        size: size || '',
        sizeDisplay: size ? translate('size', size) : '',
        shelters: item.shelters || [],
        volunteers: item.volunteers || [],
      }
    }
  }
}