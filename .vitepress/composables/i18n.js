export const translations = {
  de: {
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
      'Щенок': 'Щенок',
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
      'Посмотреть ещё': 'Посмотреть ещё',
      'Все питомцы': 'Все питомцы',
      'Нет результатов': 'Нет результатов',
      'Включить все фильтры': 'Включить все фильтры'
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
      'Щенок': 'Puppy',
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
      'Посмотреть ещё': 'View more',
      'Все питомцы': 'All pets',
      'Нет результатов': 'No results found',
      'Включить все фильтры': 'Enable all filters'
    }
  },
  ru: {
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
      'Щенок': 'Welpe',
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
      'Посмотреть ещё': 'Mehr anzeigen',
      'Все питомцы': 'Alle Tiere',
      'Нет результатов': 'Keine Ergebnisse gefunden',
      'Включить все фильтры': 'Alle Filter aktivieren'
    }
  }
}

export const getTranslate = (lang, category, key) => {
  return translations[lang]?.[category]?.[key] || key
}
export const getTranslateAge = (lang, ageStr) => {
  if (!ageStr) return ''
  const match = ageStr.match(/(\d+)\s*(год|лет|года|месяц|месяца|месяцев)/)
  if (!match) return ageStr
  const num = parseInt(match[1])
  const unit = match[2]
  const translatedUnit = getTranslate(lang, 'ageUnits', unit)
  if (lang === 'ru') {
    return `${num} ${translatedUnit}`
  }
  return `${num} ${translatedUnit}`
}
export const getTranslateDirection = (lang, directionStr) => {
  if (!directionStr) return ''
  const parts = directionStr.split(/[/,]\s*/).map(s => s.trim())
  const translatedParts = parts.map(part => {
    return getTranslate(lang, 'direction', part)
  })
  return translatedParts.join(' / ')
}