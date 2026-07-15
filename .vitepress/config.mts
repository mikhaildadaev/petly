import { defineConfig } from 'vitepress'
export default defineConfig({
  appearance: 'dark',
  base: '/petly/',
  cleanUrls: true,
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap' }],
    ['link', { rel: 'stylesheet', href: '/petly/styles.css' }],
    ['script', { src: '/petly/scripts.js' }]
  ],
  lastUpdated: true,
  locales: {
    de: {
      description: 'Jedes Tier verdient ein Zuhause',
      label: 'Deutsch',
      lang: 'de',
      link: '/de/',
      title: 'PETLY',
      themeConfig: {
        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: 'Suche',
                buttonAriaLabel: 'Suche'
              },
              modal: {
                noResultsText: 'Nichts gefunden',
                resetButtonTitle: 'Suche löschen',
                footer: {
                  selectText: 'auswählen',
                  navigateText: 'gehe zu',
                  closeText: 'schließen'
                }
              }
            }
          }
        },
        nav: [
          { 
            text: 'Startseite', 
            link: '/de/' 
          },
          { 
            text: 'Tiere', 
            items: [
              { text: 'Katzen', link: '/de/pets/cats' },
              { text: 'Hunde', link: '/de/pets/dogs' }
            ]
          },
          { 
            text: 'Dobrologie', 
            items: [
              { text: 'Freiwillige', link: '/de/humans/volunteers' },
              { text: 'Mitmachen', link: '/de/dobrology/join' },
              { text: 'Unterstützen', link: '/de/dobrology/support' }
            ]
          },
          { 
            text: 'Tipps', 
            items: [
              { text: 'Tier aufnehmen', link: '/de/recommendations/go' },
              { text: 'Gesundheit', link: '/de/recommendations/health' },
              { text: 'Probleme', link: '/de/recommendations/trouble' },
              { text: 'Rechte & Schutz', link: '/de/recommendations/welfare' }
            ]
          },
          { 
            text: 'Favoriten', 
            link: '/de/chance/favorites' 
          }
        ],
        sidebar: [
          {
            text: 'Tiere',
            items: [
              { text: 'Katzen', link: '/de/pets/cats' },
              { text: 'Hunde', link: '/de/pets/dogs' }
            ]
          },
          {
            text: 'Dobrologie',
            items: [
              { text: 'Freiwillige', link: '/de/humans/volunteers' },
              { text: 'Mitmachen', link: '/de/dobrology/join' },
              { text: 'Unterstützen', link: '/de/dobrology/support' }
            ]
          },
          {
            text: 'Tipps',
            items: [
              { text: 'Tier aufnehmen', link: '/de/recommendations/go' },
              { text: 'Gesundheit', link: '/de/recommendations/health' },
              { text: 'Probleme', link: '/de/recommendations/trouble' },
              { text: 'Rechte & Schutz', link: '/de/recommendations/welfare' }
            ]
          },
          { 
            text: 'Favoriten', 
            link: '/de/chance/favorites' 
          }
        ],
        darkModeSwitchLabel: "Design",
        darkModeSwitchTitle: "Zum dunklen Thema wechseln",
        lightModeSwitchTitle: "Zum hellen Thema wechseln",
        sidebarMenuLabel: "Menü",
        returnToTopLabel: "Nach oben",
        outline: {
          label: "Inhaltsverzeichnis"
        },
        lastUpdated: {
          text: "Zuletzt aktualisiert",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short"
          }
        },
        docFooter: {
          prev: "Vorherige Seite",
          next: "Nächste Seite"
        },
        footer: {
          message: 'Jedes Tier verdient ein Zuhause',
          copyright: '© 2026 Михаил Дадаев'
        }
      }
    },
    en: {
      description: 'Every pet deserves a home',
      label: 'English',
      lang: 'en',
      link: '/en/',
      title: 'PETLY',
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
            text: 'Home', 
            link: '/en/' 
          },
          { 
            text: 'Pets', 
            items: [
              { text: 'Cats', link: '/en/pets/cats' },
              { text: 'Dogs', link: '/en/pets/dogs' }
            ]
          },
          { 
            text: 'Dobrology', 
            items: [
              { text: 'Volunteers', link: '/en/humans/volunteers' },
              { text: 'Join us', link: '/en/dobrology/join' },
              { text: 'Support', link: '/en/dobrology/support' }
            ]
          },
          { 
            text: 'Tips', 
            items: [
              { text: 'Take a pet', link: '/en/recommendations/go' },
              { text: 'Health', link: '/en/recommendations/health' },
              { text: 'Troubles', link: '/en/recommendations/trouble' },
              { text: 'Rights & Protection', link: '/en/recommendations/welfare' }
            ]
          },
          { 
            text: 'Favorites', 
            link: '/en/chance/favorites' 
          }
        ],
        sidebar: [
          {
            text: 'Pets',
            items: [
              { text: 'Cats', link: '/en/pets/cats' },
              { text: 'Dogs', link: '/en/pets/dogs' }
            ]
          },
          {
            text: 'Dobrology',
            items: [
              { text: 'Volunteers', link: '/en/humans/volunteers' },
              { text: 'Join us', link: '/en/dobrology/join' },
              { text: 'Support', link: '/en/dobrology/support' }
            ]
          },
          {
            text: 'Советы',
            items: [
              { text: 'Take a pet', link: '/en/recommendations/go' },
              { text: 'Health', link: '/en/recommendations/health' },
              { text: 'Troubles', link: '/en/recommendations/trouble' },
              { text: 'Welfare', link: '/en/recommendations/welfare' }
            ]
          },
          { 
            text: 'Favorites', 
            link: '/en/chance/favorites' 
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
          message: 'Every pet deserves a home',
          copyright: '© 2026 Mikhail Dadaev'
        }
      }
    },
    ru: {
      description: 'Каждый питомец заслуживает дом',
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      title: 'PETLY',
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
              { text: 'Кошки', link: '/ru/pets/cats' },
              { text: 'Собаки', link: '/ru/pets/dogs' }
            ]
          },
          { 
            text: 'Добрология', 
            items: [
              { text: 'Волонтёры', link: '/ru/humans/volunteers' },
              { text: 'Присоединиться', link: '/ru/dobrology/join' },
              { text: 'Поддержать', link: '/ru/dobrology/support' }
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
          },
          { 
            text: 'Любимцы', 
            link: '/ru/chance/favorites' 
          }
        ],
        sidebar: [
          {
            text: 'Питомцы',
            items: [
              { text: 'Кошки', link: '/ru/pets/cats' },
              { text: 'Собаки', link: '/ru/pets/dogs' }
            ]
          },
          {
            text: 'Добрология',
            items: [
              { text: 'Волонтёры', link: '/ru/humans/volunteers' },
              { text: 'Присоединиться', link: '/ru/dobrology/join' },
              { text: 'Поддержать', link: '/ru/dobrology/support' }
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
          },
          { 
            text: 'Любимцы', 
            link: '/ru/chance/favorites' 
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
        link: 'https://github.com/mikhaildadaev/petly' 
      }
    ],
  }
})