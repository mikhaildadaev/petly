export const translations = {
  de: {
    filter: {
      'Gender': 'Geschlecht',
      'Size': 'Größe',
      'Age': 'Alter',
      'Experience': 'Erfahrung',
      'Direction': 'Richtung',
      'Format': 'Format'
    },
    gender: {
      'Female': 'Weiblich',
      'Male': 'Männlich'
    },
    age: {
      'Baby': 'Baby',
      'Young': 'Jung',
      'Adult': 'Erwachsen'
    },
    ageUnits: {
      'year': 'Jahr',
      'year_dec': 'Jahre',
      'years': 'Jahre',
      'month': 'Monat',
      'month_dec': 'Monate',
      'months': 'Monate'
    },
    size: {
      'Small': 'Klein',
      'Medium': 'Mittel',
      'Large': 'Groß'
    },
    direction: {
      'Walking': 'Gassi gehen',
      'Socialization': 'Sozialisierung',
      'Treatment': 'Behandlung',
      'Fostering': 'Pflegestelle',
      'Creative': 'Kreativ',
      'Fundraising': 'Fundraising'
    },
    experience: {
      'Beginner': 'Anfänger',
      'Experienced': 'Erfahren',
      'Expert': 'Experte'
    },
    format: {
      'State': 'Staatlich',
      'Private': 'Privat'
    },
    info: {
      address: 'Adresse',
      mode: 'Öffnungszeiten',
      email: 'E-Mail',
      phone: 'Telefon',
      telegram: 'Telegram',
      site: 'Webseite'
    },
    ui: {
      'Reset the filters': 'Filter zurücksetzen',
      'Load next': 'Nächste laden',
      'Load previous': 'Vorherige laden',
      'left': 'übrig',
      'Go to section': 'Zum Bereich gehen',
      'Add to favorites': 'Zu Favoriten hinzufügen',
      'Go to link': 'Zum Link',
      'More detailed': 'Mehr erfahren',
      'No data': 'Keine Daten'
    }
  },
  en: {
    filter: {
      'Gender': 'Gender',
      'Size': 'Size',
      'Age': 'Age',
      'Experience': 'Experience',
      'Direction': 'Direction',
      'Format': 'Format'
    },
    gender: {
      'Female': 'Female',
      'Male': 'Male'
    },
    age: {
      'Baby': 'Baby',
      'Young': 'Young',
      'Adult': 'Adult'
    },
    ageUnits: {
      'year': 'year',
      'year_dec': 'years',
      'years': 'years',
      'month': 'month',
      'month_dec': 'months',
      'months': 'months'
    },
    size: {
      'Small': 'Small',
      'Medium': 'Medium',
      'Large': 'Large'
    },
    direction: {
      'Walking': 'Walking',
      'Socialization': 'Socialization',
      'Treatment': 'Treatment',
      'Fostering': 'Fostering',
      'Creative': 'Creative',
      'Fundraising': 'Fundraising'
    },
    experience: {
      'Beginner': 'Beginner',
      'Experienced': 'Experienced',
      'Expert': 'Expert'
    },
    format: {
      'State': 'State',
      'Private': 'Private'
    },
    info: {
      address: 'Address',
      mode: 'Working hours',
      email: 'Email',
      phone: 'Phone',
      telegram: 'Telegram',
      site: 'Website'
    },
    ui: {
      'Reset the filters': 'Reset the filters',
      'Load next': 'Load next',
      'Load previous': 'Load previous',
      'left': 'left',
      'Go to section': 'Go to section',
      'Add to favorites': 'Add to favorites',
      'Go to link': 'Go to link',
      'More detailed': 'More detailed',
      'No data': 'No data'
    }
  },
  ru: {
    filter: {
      'Gender': 'Пол',
      'Size': 'Размер',
      'Age': 'Возраст',
      'Experience': 'Опыт',
      'Direction': 'Направление',
      'Format': 'Формат'
    },
    gender: {
      'Female': 'Девочка',
      'Male': 'Мальчик'
    },
    age: {
      'Baby': 'Детеныш',
      'Young': 'Молодая',
      'Adult': 'Взрослая'
    },
    ageUnits: {
      'year': 'год',
      'year_dec': 'года',
      'years': 'лет',
      'month': 'месяц',
      'month_dec': 'месяца',
      'months': 'месяцев'
    },
    size: {
      'Small': 'Маленькая',
      'Medium': 'Средняя',
      'Large': 'Крупная'
    },
    direction: {
      'Walking': 'Выгул',
      'Socialization': 'Социализация',
      'Treatment': 'Лечение',
      'Fostering': 'Передержка',
      'Creative': 'Креатив',
      'Fundraising': 'Фандрайзинг'
    },
    experience: {
      'Beginner': 'Начинающий',
      'Experienced': 'Опытный',
      'Expert': 'Эксперт'
    },
    format: {
      'State': 'Государственный',
      'Private': 'Частный'
    },
    info: {
      address: 'Адрес',
      mode: 'Режим работы',
      email: 'Email',
      phone: 'Телефон',
      telegram: 'Telegram',
      site: 'Сайт'
    },
    ui: {
      'Reset the filters': 'Сбросить фильтры',
      'Load next': 'Загрузить следующие',
      'Load previous': 'Загрузить предыдущие',
      'left': 'осталось',
      'Go to section': 'Перейти в раздел',
      'Add to favorites': 'Добавить в избранное',
      'Go to link': 'Перейти по ссылке',
      'More detailed': 'Подробнее',
      'No data': 'Нет данных'
    }
  }
}
export const useTranslate = (lang, category, key) => {
  return translations[lang]?.[category]?.[key] || key
}
export const useAge = (lang, startDate) => {
  if (!startDate) return useTranslate(lang, 'ui', 'No data')
  const start = new Date(startDate)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  const useUnit = (num, unit) => {
    if (lang === 'ru') {
      const lastDigit = num % 10
      const lastTwoDigits = num % 100
      if (unit === 'year') {
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return useTranslate(lang, 'ageUnits', 'years')
        if (lastDigit === 1) return useTranslate(lang, 'ageUnits', 'year')
        if (lastDigit >= 2 && lastDigit <= 4) return useTranslate(lang, 'ageUnits', 'year_dec')
        return useTranslate(lang, 'ageUnits', 'years')
      }
      if (unit === 'month') {
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return useTranslate(lang, 'ageUnits', 'months')
        if (lastDigit === 1) return useTranslate(lang, 'ageUnits', 'month')
        if (lastDigit >= 2 && lastDigit <= 4) return useTranslate(lang, 'ageUnits', 'month_dec')
        return useTranslate(lang, 'ageUnits', 'months')
      }
      return useTranslate(lang, 'ageUnits', unit)
    }
    if (unit === 'year') {
      return num === 1
        ? useTranslate(lang, 'ageUnits', 'year')
        : useTranslate(lang, 'ageUnits', 'years')
    }
    if (unit === 'month') {
      return num === 1
        ? useTranslate(lang, 'ageUnits', 'month')
        : useTranslate(lang, 'ageUnits', 'months')
    }
    return useTranslate(lang, 'ageUnits', unit)
  }
  if (years < 1) {
    const monthUnit = useUnit(months, 'month')
    return `${months} ${monthUnit}`
  }
  const yearUnit = useUnit(years, 'year')
  let result = `${years} ${yearUnit}`
  if (months > 0) {
    const monthUnit = useUnit(months, 'month')
    result += ` ${months} ${monthUnit}`
  }
  return result
}
export const useAgePetCategory = (birthday) => {
  if (!birthday) return ''
  const birthDate = new Date(birthday)
  const now = new Date()
  let months = (now.getFullYear() - birthDate.getFullYear()) * 12
  months += now.getMonth() - birthDate.getMonth()
  if (now.getDate() < birthDate.getDate()) {
    months--
  }
  if (months <= 12) return 'Baby'
  if (months <= 60) return 'Young'
  return 'Adult'
}
export const useDirection = (lang, directionStr) => {
  if (!directionStr) return ''
  const parts = directionStr.split(/[/,]\s*/).map(s => s.trim())
  const translatedParts = parts.map(part => {
    return useTranslate(lang, 'direction', part)
  })
  return translatedParts.join(' / ')
}
export const useExperience = (lang, startDate) => {
  if (!startDate) return useTranslate(lang, 'ui', 'No data')
  const start = new Date(startDate)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  let categoryKey
  if (years < 1) {
    categoryKey = 'Beginner'
  } else if (years <= 3) {
    categoryKey = 'Experienced'
  } else {
    categoryKey = 'Expert'
  }
  return useTranslate(lang, 'experience', categoryKey)
}
export const useInfoLabel = (lang, key) => {
  return translations[lang]?.['info']?.[key] || key
}