import { defineConfig } from 'vitepress'
export default defineConfig({
  appearance: 'dark',
  base: '/',
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/assets/favicon/16x16.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/assets/favicon/32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/assets/favicon/48x48.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '57x57', href: '/assets/favicon/57x57.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '60x60', href: '/assets/favicon/60x60.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/assets/favicon/64x64.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '70x70', href: '/assets/favicon/70x70.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '72x72', href: '/assets/favicon/72x72.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '76x76', href: '/assets/favicon/76x76.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/assets/favicon/96x96.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '114x114', href: '/assets/favicon/114x114.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '120x120', href: '/assets/favicon/120x120.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '128x128', href: '/assets/favicon/128x128.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '144x144', href: '/assets/favicon/144x144.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '150x150', href: '/assets/favicon/150x150.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '152x152', href: '/assets/favicon/152x152.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '167x167', href: '/assets/favicon/167x167.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '180x180', href: '/assets/favicon/180x180.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/assets/favicon/192x192.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '256x256', href: '/assets/favicon/256x256.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '310x310', href: '/assets/favicon/310x310.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '384x384', href: '/assets/favicon/384x384.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/assets/favicon/512x512.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/assets/favicon/57x57.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/assets/favicon/60x60.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/assets/favicon/72x72.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/assets/favicon/76x76.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '114x114', href: '/assets/favicon/114x114.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/assets/favicon/120x120.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '144x144', href: '/assets/favicon/144x144.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '152x152', href: '/assets/favicon/152x152.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '167x167', href: '/assets/favicon/167x167.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/assets/favicon/180x180.png' }],
    ['meta', { name: 'msapplication-TileImage', content: '/assets/favicon/144x144.png' }],
    ['meta', { name: 'msapplication-square70x70logo', content: '/assets/favicon/70x70.png' }],
    ['meta', { name: 'msapplication-square150x150logo', content: '/assets/favicon/150x150.png' }],
    ['meta', { name: 'msapplication-wide310x150logo', content: '/assets/favicon/310x150.png' }],
    ['meta', { name: 'msapplication-square310x310logo', content: '/assets/favicon/310x310.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#ede4d8' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { name: 'apple-touch-fullscreen', content: 'yes' }],
    ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'theme-color', content: '#ede4d8' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
    ['meta', { name: 'yandex-verification', content: 'ec7c41503747d406' }],
    ['script', { async: '', src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': JSON.stringify({"token": "c723467560bf4cdda2612ec1fdaf97b6"})}]
  ],
  cleanUrls: true,
  lastUpdated: true,
  locales: {
    de: {
      description: 'Jedes Tier verdient ein Zuhause',
      head: [
        ['link', { rel: 'manifest', href: '/assets/json/manifest_de.json' }],
      ],
      label: 'Deutsch',
      lang: 'de',
      link: '/de/',
      title: '#BrauchtHeim',
      themeConfig: {
        notFound: {
          title: 'Hoppla! Seite nicht gefunden 🐾',
          quote: 'Sieht so aus, als wäre diese Seite spazieren gegangen. Aber wir helfen dir, den Weg nach Hause zu finden!',
          linkText: 'Zurück zur Startseite',
        },
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
            text: 'Über das Projekt',
            items: [
              { text: 'Mission', link: '/de/about/mission' },
              { text: 'Kontakte', link: '/de/about/contacts' },
              { text: 'Technologien', link: '/de/about/tech' }
            ]
          },
          { 
            text: 'Tiere', 
            items: [
              { text: 'Hunde', link: '/de/pets/dogs' },
              { text: 'Katzen', link: '/de/pets/cats' },
              { text: 'Favoriten', link: '/de/pets/favorites' }
            ]
          },
          { 
            text: 'Dobrologie', 
            items: [
              { text: 'Tierheime', link: '/de/organizations/shelters' },
              { text: 'Unterstützen', link: '/de/dobrology/support' },
              { text: 'Freiwillige', link: '/de/humans/volunteers' },
              { text: 'Mitmachen', link: '/de/dobrology/join' }
            ]
          },
          { 
            text: 'Tipps', 
            items: [
              { text: 'Vermittlung', link: '/de/recommendations/go' },
              { text: 'Gesundheit', link: '/de/recommendations/health' },
              { text: 'Schutz', link: '/de/recommendations/protection' },
              { text: 'Probleme', link: '/de/recommendations/trouble' }
            ]
          }
        ],
        sidebar: [
          {
            text: 'Über das Projekt',
            items: [
              { text: 'Mission', link: '/de/about/mission' },
              { text: 'Kontakte', link: '/de/about/contacts' },
              { text: 'Technologien', link: '/de/about/tech' }
            ]
          },
          {
            text: 'Tiere',
            items: [
              { text: 'Hunde', link: '/de/pets/dogs' },
              { text: 'Katzen', link: '/de/pets/cats' },
              { text: 'Favoriten', link: '/de/pets/favorites' }
            ]
          },
          {
            text: 'Dobrologie',
            items: [
              { text: 'Tierheime', link: '/de/organizations/shelters' },
              { text: 'Unterstützen', link: '/de/dobrology/support' },
              { text: 'Freiwillige', link: '/de/humans/volunteers' },
              { text: 'Mitmachen', link: '/de/dobrology/join' }
            ]
          },
          {
            text: 'Tipps',
            items: [
              { text: 'Vermittlung', link: '/de/recommendations/go' },
              { text: 'Gesundheit', link: '/de/recommendations/health' },
              { text: 'Schutz', link: '/de/recommendations/protection' },
              { text: 'Probleme', link: '/de/recommendations/trouble' }
            ]
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
          copyright: '© 2026 Michail Dadajew • Apache License 2.0'
        }
      }
    },
    en: {
      description: 'Every pet deserves a home',
      head: [
        ['link', { rel: 'manifest', href: '/assets/json/manifest_en.json' }],
      ],
      label: 'English',
      lang: 'en',
      link: '/en/',
      title: '#NeedHome',
      themeConfig: {
        notFound: {
          title: 'Oops! Page not found 🐾',
          quote: 'Looks like this page went for a walk. But we\'ll help you find your way home!',
          linkText: 'Return to home',
        },
        search: {
          provider: 'local',
          options: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search'
              },
              modal: {
                noResultsText: 'No results found',
                resetButtonTitle: 'Clear search',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                  closeText: 'to close'
                }
              }
            }
          }
        },
        nav: [
          {
            text: 'About Project',
            items: [
              { text: 'Mission', link: '/en/about/mission' },
              { text: 'Contacts', link: '/en/about/contacts' },
              { text: 'Technologies', link: '/en/about/tech' }
            ]
          },
          { 
            text: 'Pets', 
            items: [
              { text: 'Dogs', link: '/en/pets/dogs' },
              { text: 'Cats', link: '/en/pets/cats' },
              { text: 'Favorites', link: '/en/pets/favorites' }
            ]
          },
          { 
            text: 'Dobrology', 
            items: [
              { text: 'Shelters', link: '/en/organizations/shelters' },
              { text: 'Support', link: '/en/dobrology/support' },
              { text: 'Volunteers', link: '/en/humans/volunteers' },
              { text: 'Join us', link: '/en/dobrology/join' }
            ]
          },
          { 
            text: 'Tips', 
            items: [
              { text: 'Placement', link: '/en/recommendations/go' },
              { text: 'Health', link: '/en/recommendations/health' },
              { text: 'Protection', link: '/en/recommendations/protection' },
              { text: 'Troubles', link: '/en/recommendations/trouble' }
            ]
          }
        ],
        sidebar: [
          {
            text: 'About Project',
            items: [
              { text: 'Mission', link: '/en/about/mission' },
              { text: 'Contacts', link: '/en/about/contacts' },
              { text: 'Technologies', link: '/en/about/tech' }
            ]
          },
          {
            text: 'Pets',
            items: [
              { text: 'Dogs', link: '/en/pets/dogs' },
              { text: 'Cats', link: '/en/pets/cats' },
              { text: 'Favorites', link: '/en/pets/favorites' }
            ]
          },
          {
            text: 'Dobrology',
            items: [
              { text: 'Shelters', link: '/en/organizations/shelters' },
              { text: 'Support', link: '/en/dobrology/support' },
              { text: 'Volunteers', link: '/en/humans/volunteers' },
              { text: 'Join us', link: '/en/dobrology/join' }
            ]
          },
          {
            text: 'Tips',
            items: [
              { text: 'Placement', link: '/en/recommendations/go' },
              { text: 'Health', link: '/en/recommendations/health' },
              { text: 'Protection', link: '/en/recommendations/protection' },
              { text: 'Troubles', link: '/en/recommendations/trouble' }
            ]
          }
        ],
        darkModeSwitchLabel: "Appearance",
        darkModeSwitchTitle: "Switch to dark theme",
        lightModeSwitchTitle: "Switch to light theme",
        sidebarMenuLabel: "Menu",
        returnToTopLabel: "Return to top",
        outline: {
          label: "On this page"
        },
        lastUpdated: {
          text: "Last Updated",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short"
          }
        },
        docFooter: {
          prev: "Previous page",
          next: "Next page"
        },
        footer: {
          message: 'Every pet deserves a home',
          copyright: '© 2026 Mikhail Dadaev • Apache License 2.0'
        }
      }
    },
    ru: {
      description: 'Каждый питомец заслуживает дом',
      head: [
        ['link', { rel: 'manifest', href: '/assets/json/manifest_ru.json' }],
      ],
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      title: '#НуженДом',
      themeConfig: {
        notFound: {
          title: 'Ой! Страница не найдена 🐾',
          quote: 'Похоже, эта страница ушла гулять. Но мы поможем найти дорогу домой!',
          linkText: 'Вернуться на главную',
        },
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
            text: 'О проекте',
            items: [
              { text: 'Миссия', link: '/ru/about/mission' },
              { text: 'Контакты', link: '/ru/about/contacts' },
              { text: 'Технологии', link: '/ru/about/tech' }
            ]
          },
          { 
            text: 'Питомцы', 
            items: [
              { text: 'Собаки', link: '/ru/pets/dogs' },
              { text: 'Кошки', link: '/ru/pets/cats' },
              { text: 'Любимцы', link: '/ru/pets/favorites' }
            ]
          },
          { 
            text: 'Добрология', 
            items: [
              { text: 'Приюты', link: '/ru/organizations/shelters' },
              { text: 'Поддержать', link: '/ru/dobrology/support' },
              { text: 'Волонтёры', link: '/ru/humans/volunteers' },
              { text: 'Присоединиться', link: '/ru/dobrology/join' }
            ]
          },
          { 
            text: 'Советы', 
            items: [
              { text: 'Пристройство', link: '/ru/recommendations/go' },
              { text: 'Здоровье', link: '/ru/recommendations/health' },
              { text: 'Защита', link: '/ru/recommendations/protection' },
              { text: 'Неприятности', link: '/ru/recommendations/trouble' }
            ]
          }
        ],
        sidebar: [
          {
            text: 'О проекте',
            items: [
              { text: 'Миссия', link: '/ru/about/mission' },
              { text: 'Контакты', link: '/ru/about/contacts' },
              { text: 'Технологии', link: '/ru/about/tech' }
            ]
          },
          {
            text: 'Питомцы',
            items: [
              { text: 'Собаки', link: '/ru/pets/dogs' },
              { text: 'Кошки', link: '/ru/pets/cats' },
              { text: 'Любимцы', link: '/ru/pets/favorites' }
            ]
          },
          {
            text: 'Добрология',
            items: [
              { text: 'Приюты', link: '/ru/organizations/shelters' },
              { text: 'Поддержать', link: '/ru/dobrology/support' },
              { text: 'Волонтёры', link: '/ru/humans/volunteers' },
              { text: 'Присоединиться', link: '/ru/dobrology/join' }
            ]
          },
          {
            text: 'Советы',
            items: [
              { text: 'Пристройство', link: '/ru/recommendations/go' },
              { text: 'Здоровье', link: '/ru/recommendations/health' },
              { text: 'Защита', link: '/ru/recommendations/protection' },
              { text: 'Неприятности', link: '/ru/recommendations/trouble' }
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
          copyright: '© 2026 Михаил Дадаев • Apache License 2.0'
        }
      }
    }
  },
  sitemap: {
    hostname: 'https://needhome.pro'
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