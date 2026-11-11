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
      experience: { keys: ['Beginner', 'Experienced', 'Expert'], label: 'Experience' },
      direction: { keys: ['Walking', 'Socialization', 'Treatment', 'Fostering', 'Creative', 'Fundraising'], label: 'Direction' }
    },
    icons: {
      experience: { 'Beginner': 'begin', 'Experienced': 'versed', 'Expert': 'expert' },
      direction: { 'Walking': 'walk', 'Socialization': 'social', 'Treatment': 'treatment', 'Fostering': 'foster', 'Creative': 'creative', 'Fundraising': 'fundraising' }
    },
    transform: (item, lang, translate) => {
      const filter = item.filter || []
      const direction = getFilterValue(filter, 'direction')
      const experience = getFilterValue(filter, 'experience')
      return {
        nameDisplay: item.title || '',
        descriptionDisplay: item.description || '',
        direction: useDirection('en', direction),
        directionDisplay: useDirection(lang, direction),
        experience: useExperience('en', experience),
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
      format: { keys: ['State', 'Private'], label: 'Format' }
    },
    icons: {
      format: { 'State': 'state', 'Private': 'private' }
    },
    transform: (item, lang, translate) => {
      const filter = item.filter || []
      const format = getFilterValue(filter, 'format')
      return {
        nameDisplay: item.title || '',
        descriptionDisplay: item.description || '',
        format: useTranslate('en', 'format', format),
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
      gender: { keys: ['Female', 'Male'], label: 'Gender' },
      age: { keys: ['Baby', 'Young', 'Adult'], label: 'Age' },
      size: { keys: ['Small', 'Medium', 'Large'], label: 'Size' }
    },
    icons: {
      gender: { 'Female': 'woman', 'Male': 'man' },
      age: { 'Baby': 'young', 'Young': 'middle', 'Adult': 'old' },
      size: { 'Small': 'small', 'Medium': 'medium', 'Large': 'large' }
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