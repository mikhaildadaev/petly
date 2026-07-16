export const translations = {
  ru: {
    filter: {
      'Пол': 'ПОЛ',
      'Размер': 'РАЗМЕР',
      'Возраст': 'ВОЗРАСТ',
      'Опыт': 'ОПЫТ',
      'Направление': 'НАПРАВЛЕНИЕ',
      'Сбросить': 'СБРОСИТЬ'
    },
    gender: {
      'Девочка': 'Девочка',
      'Мальчик': 'Мальчик'
    },
    age: {
      'Детеныш': 'Детеныш',
      'Молодая': 'Молодая',
      'Взрослая': 'Взрослая'
    },
    ageUnits: {
      'год': 'год',
      'года': 'года',
      'лет': 'лет',
      'месяц': 'месяц',
      'месяца': 'месяца',
      'месяцев': 'месяцев'
    },
    size: {
      'Маленькая': 'Маленькая',
      'Средняя': 'Средняя',
      'Крупная': 'Крупная'
    },
    direction: {
      'Выгул': 'Выгул',
      'Социализация': 'Социализация',
      'Лечение': 'Лечение',
      'Передержка': 'Передержка',
      'Креатив': 'Креатив',
      'Фандрайзинг': 'Фандрайзинг'
    },
    experience: {
      'Начинающий': 'Начинающий',
      'Опытный': 'Опытный',
      'Эксперт': 'Эксперт'
    },
    ui: {
      'осталось': 'осталось',
      'Загрузить ещё': 'Загрузить ещё',
      'Перейти в раздел': 'Перейти в раздел',
      'Все питомцы': 'Все питомцы',
      'Нет результатов': 'Нет результатов',
      'Включить все фильтры': 'Включить все фильтры',
      'Добавить в избранное': 'В любимцы',
      'Нет назначенных волонтеров': 'Нет назначенных волонтеров',
      'Нет выбранных любимцев': 'Нет выбранных любимцев'
    }
  },
  en: {
    filter: {
      'Пол': 'GENDER',
      'Размер': 'SIZE',
      'Возраст': 'AGE',
      'Опыт': 'EXPERIENCE',
      'Направление': 'DIRECTION',
      'Сбросить': 'RESET'
    },
    gender: {
      'Девочка': 'Female',
      'Мальчик': 'Male'
    },
    age: {
      'Детеныш': 'Baby',
      'Молодая': 'Young',
      'Взрослая': 'Adult'
    },
    ageUnits: {
      'год': 'year',
      'года': 'years',
      'лет': 'years',
      'месяц': 'month',
      'месяца': 'months',
      'месяцев': 'months'
    },
    size: {
      'Маленькая': 'Small',
      'Средняя': 'Medium',
      'Крупная': 'Large'
    },
    direction: {
      'Выгул': 'Walking',
      'Социализация': 'Socialization',
      'Лечение': 'Treatment',
      'Передержка': 'Fostering',
      'Креатив': 'Creative',
      'Фандрайзинг': 'Fundraising'
    },
    experience: {
      'Начинающий': 'Beginner',
      'Опытный': 'Experienced',
      'Эксперт': 'Expert'
    },
    ui: {
      'осталось': 'left',
      'Загрузить ещё': 'Load more',
      'Перейти в раздел': 'Go to section',
      'Все питомцы': 'All pets',
      'Нет результатов': 'No results found',
      'Включить все фильтры': 'Enable all filters',
      'Добавить в избранное': 'Add to favorites',
      'Нет назначенных волонтеров': 'No assigned volunteers',
      'Нет выбранных любимцев': 'No favorites selected'
    }
  },
  de: {
    filter: {
      'Пол': 'GESCHLECHT',
      'Размер': 'GRÖSSE',
      'Возраст': 'ALTER',
      'Опыт': 'ERFAHRUNG',
      'Направление': 'RICHTUNG',
      'Сбросить': 'ZURÜCKSETZEN'
    },
    gender: {
      'Девочка': 'Weiblich',
      'Мальчик': 'Männlich'
    },
    age: {
      'Детеныш': 'Baby',
      'Молодая': 'Jung',
      'Взрослая': 'Erwachsen'
    },
    ageUnits: {
      'год': 'Jahr',
      'года': 'Jahre',
      'лет': 'Jahre',
      'месяц': 'Monat',
      'месяца': 'Monate',
      'месяцев': 'Monate'
    },
    size: {
      'Маленькая': 'Klein',
      'Средняя': 'Mittel',
      'Крупная': 'Groß'
    },
    direction: {
      'Выгул': 'Gassi gehen',
      'Социализация': 'Sozialisierung',
      'Лечение': 'Behandlung',
      'Передержка': 'Pflegestelle',
      'Креатив': 'Kreativ',
      'Фандрайзинг': 'Fundraising'
    },
    experience: {
      'Начинающий': 'Anfänger',
      'Опытный': 'Erfahren',
      'Эксперт': 'Experte'
    },
    ui: {
      'осталось': 'übrig',
      'Загрузить ещё': 'Mehr laden',
      'Перейти в раздел': 'Zum Bereich',
      'Все питомцы': 'Alle Tiere',
      'Нет результатов': 'Keine Ergebnisse gefunden',
      'Включить все фильтры': 'Alle Filter aktivieren',
      'Добавить в избранное': 'Zu Favoriten',
      'Нет назначенных волонтеров': 'Keine zugewiesenen Freiwilligen',
      'Нет выбранных любимцев': 'Keine Favoriten ausgewählt'
    }
  }
}

export const getTranslate = (lang, category, key) => {
  return translations[lang]?.[category]?.[key] || key
}
export const getAge = (lang, startDate) => {
  if (!startDate) return getTranslate(lang, 'ui', 'Нет данных')
  const start = new Date(startDate)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  if (years < 1 && months === 0) {
    return getTranslate(lang, 'ui', 'Меньше месяца')
  }
  const getUnit = (num, unit) => {
    const lastDigit = num % 10
    const lastTwoDigits = num % 100
    if (unit === 'год') {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return getTranslate(lang, 'ageUnits', 'лет')
      if (lastDigit === 1) return getTranslate(lang, 'ageUnits', 'год')
      if (lastDigit >= 2 && lastDigit <= 4) return getTranslate(lang, 'ageUnits', 'года')
      return getTranslate(lang, 'ageUnits', 'лет')
    }
    if (unit === 'месяц') {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return getTranslate(lang, 'ageUnits', 'месяцев')
      if (lastDigit === 1) return getTranslate(lang, 'ageUnits', 'месяц')
      if (lastDigit >= 2 && lastDigit <= 4) return getTranslate(lang, 'ageUnits', 'месяца')
      return getTranslate(lang, 'ageUnits', 'месяцев')
    }
    return getTranslate(lang, 'ageUnits', unit)
  }
  if (years < 1) {
    const monthUnit = getUnit(months, 'месяц')
    return `${months} ${monthUnit}`
  }
  const yearUnit = getUnit(years, 'год')
  let result = `${years} ${yearUnit}`
  
  if (months > 0) {
    const monthUnit = getUnit(months, 'месяц')
    result += ` ${months} ${monthUnit}`
  }
  return result
}
export const getAgePetCategory = (birthday) => {
  if (!birthday) return ''
  const birthDate = new Date(birthday)
  const now = new Date()
  let months = (now.getFullYear() - birthDate.getFullYear()) * 12
  months += now.getMonth() - birthDate.getMonth()
  if (now.getDate() < birthDate.getDate()) {
    months--
  }
  if (months <= 12) return 'Детеныш'
  if (months <= 36) return 'Молодая'
  return 'Взрослая'
}
export const getDirection = (lang, directionStr) => {
  if (!directionStr) return ''
  const parts = directionStr.split(/[/,]\s*/).map(s => s.trim())
  const translatedParts = parts.map(part => {
    return getTranslate(lang, 'direction', part)
  })
  return translatedParts.join(' / ')
}
export const getExperience = (lang, startDate) => {
  if (!startDate) return getTranslate(lang, 'ui', 'Нет данных')
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
    categoryKey = 'Начинающий'
  } else if (years <= 3) {
    categoryKey = 'Опытный'
  } else {
    categoryKey = 'Эксперт'
  }
  return getTranslate(lang, 'experience', categoryKey)
}