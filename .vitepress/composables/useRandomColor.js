import { ref, onMounted } from 'vue'

// === ГЛОБАЛЬНЫЙ КЭШ ДЛЯ ЦВЕТОВ ===
const randomClassCache = new Map()

export function useRandomColor() {
  const previousColor = ref(0)

  /**
   * Получение случайного класса для карточки
   * @param {string} uuid - UUID сущности
   * @param {number} maxColors - количество цветов (по умолчанию 30)
   * @returns {string} - случайный класс rand-XX
   */
  const getRandomClass = (uuid, maxColors = 30) => {
    if (!uuid) return 'rand-01'
    
    if (randomClassCache.has(uuid)) {
      return randomClassCache.get(uuid)
    }
    
    let num
    let attempts = 0
    do {
      num = Math.floor(Math.random() * maxColors) + 1
      attempts++
      if (attempts > 50) break
    } while (num === previousColor.value)
    
    previousColor.value = num
    
    const formattedNum = num.toString().padStart(2, '0')
    const className = `rand-${formattedNum}`
    
    randomClassCache.set(uuid, className)
    return className
  }

  /**
   * Очистка кэша
   */
  const clearColorCache = () => {
    randomClassCache.clear()
    previousColor.value = 0
  }

  return {
    getRandomClass,
    clearColorCache,
  }
}