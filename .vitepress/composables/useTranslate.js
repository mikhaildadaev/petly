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

export const useTranslate = (lang, category, key) => {
  return translations[lang]?.[category]?.[key] || key
}
export const useAge = (lang, startDate) => {
  if (!startDate) return useTranslate(lang, 'ui', 'Нет данных')
  const start = new Date(startDate)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  if (years < 1 && months === 0) {
    return useTranslate(lang, 'ui', 'Меньше месяца')
  }
  const useUnit = (num, unit) => {
    const lastDigit = num % 10
    const lastTwoDigits = num % 100
    if (unit === 'год') {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return useTranslate(lang, 'ageUnits', 'лет')
      if (lastDigit === 1) return useTranslate(lang, 'ageUnits', 'год')
      if (lastDigit >= 2 && lastDigit <= 4) return useTranslate(lang, 'ageUnits', 'года')
      return useTranslate(lang, 'ageUnits', 'лет')
    }
    if (unit === 'месяц') {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return useTranslate(lang, 'ageUnits', 'месяцев')
      if (lastDigit === 1) return useTranslate(lang, 'ageUnits', 'месяц')
      if (lastDigit >= 2 && lastDigit <= 4) return useTranslate(lang, 'ageUnits', 'месяца')
      return useTranslate(lang, 'ageUnits', 'месяцев')
    }
    return useTranslate(lang, 'ageUnits', unit)
  }
  if (years < 1) {
    const monthUnit = useUnit(months, 'месяц')
    return `${months} ${monthUnit}`
  }
  const yearUnit = useUnit(years, 'год')
  let result = `${years} ${yearUnit}`
  
  if (months > 0) {
    const monthUnit = useUnit(months, 'месяц')
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
  if (months <= 12) return 'Детеныш'
  if (months <= 36) return 'Молодая'
  return 'Взрослая'
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
  if (!startDate) return useTranslate(lang, 'ui', 'Нет данных')
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
  return useTranslate(lang, 'experience', categoryKey)
}