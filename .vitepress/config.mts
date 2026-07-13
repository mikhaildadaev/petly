import { defineConfig } from 'vitepress'
export default defineConfig({
  appearance: 'dark',
  base: '/pets/',
  cleanUrls: true,
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap' }],
    ['link', { rel: 'stylesheet', href: '/pets/styles.css' }],
    ['script', { src: '/pets/scripts.js' }]
  ],
  lastUpdated: true,
  locales: {
    ru: {
      description: 'Каждый питомец заслуживает дом',
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      title: 'PETS',
      themeConfig: {
        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск'
              },
              modal: {
                noResultsText: 'Ничего не найдено',
                resetButtonTitle: 'Очистить поиск',
                footer: {
                  selectText: 'выбрать',
                  navigateText: 'перейти',
                  closeText: 'закрыть'
                }
              }
            }
          }
        },
        nav: [
          { 
            text: 'Главная', 
            link: '/ru/' 
          },
          { 
            text: 'Питомцы', 
            items: [
              { text: 'Кошки', link: '/ru/cats' },
              { text: 'Собаки', link: '/ru/dogs' }
            ]
          },
          { 
            text: 'Волонтёрство', 
            items: [
              { text: 'Стать волонтёром', link: '/ru/help/go' },
              { text: 'Помощь делом', link: '/ru/help/deed' },
              { text: 'Помощь вещами', link: '/ru/help/things' },
              { text: 'Помощь деньгами', link: '/ru/help/money' },
              { text: 'Волонтёры', link: '/ru/volunteers' }
            ]
          },
          { 
            text: 'Советы', 
            items: [
              { text: 'Взять питомца', link: '/ru/recommendations/go' },
              { text: 'Здоровье', link: '/ru/recommendations/health' },
              { text: 'Неприятности', link: '/ru/recommendations/trouble' },
              { text: 'Права и защита', link: '/ru/recommendations/welfare' }
            ]
          }
        ],
        sidebar: [
          {
            text: 'Питомцы',
            items: [
              { text: 'Кошки', link: '/ru/cats' },
              { text: 'Собаки', link: '/ru/dogs' }
            ]
          },
          {
            text: 'Волонтёрство',
            items: [
              { text: 'Стать волонтёром', link: '/ru/help/go' },
              { text: 'Помощь делом', link: '/ru/help/deed' },
              { text: 'Помощь вещами', link: '/ru/help/things' },
              { text: 'Помощь деньгами', link: '/ru/help/money' },
              { text: 'Волонтёры', link: '/ru/volunteers' }
            ]
          },
          {
            text: 'Советы',
            items: [
              { text: 'Взять питомца', link: '/ru/recommendations/go' },
              { text: 'Здоровье', link: '/ru/recommendations/health' },
              { text: 'Неприятности', link: '/ru/recommendations/trouble' },
              { text: 'Права и защита', link: '/ru/recommendations/welfare' }
            ]
          }
        ],
        darkModeSwitchLabel: "Внешний вид",
        darkModeSwitchTitle: "Переключиться на тёмную тему",
        lightModeSwitchTitle: "Переключиться на светлую тему",
        sidebarMenuLabel: "Меню",
        returnToTopLabel: "Вернуться наверх",
        outline: {
          label: "Содержание страницы"
        },
        lastUpdated: {
          text: "Последние изменения",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short"
          }
        },
        docFooter: {
          prev: "Предыдущая страница",
          next: "Следующая страница"
        },
        footer: {
          message: 'Каждый питомец заслуживает дом',
          copyright: '© 2026 Михаил Дадаев'
        }
      }
    }
  },
  themeConfig: {
    search: {
      provider: 'local'
    },
    socialLinks: [
      { 
        icon: 'github', 
        link: 'https://github.com/mikhaildadaev/pets' 
      }
    ],
  }
})