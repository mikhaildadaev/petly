export const pageImages = {
  
  '/': {
    src: '/assets/webp/page_main.webp',
    width: 320,
    float: 'center'
  },
  
  '/about/contacts': {
    src: '/assets/webp/page_contacts.webp',
    width: 320,
    float: 'left'
  },
  '/about/mission': {
    src: '/assets/webp/page_mission.webp',
    width: 320,
    float: 'right'
  },
  '/about/tech': {
    src: '/assets/webp/page_tech.webp',
    width: 320,
    float: 'center'
  },

  '/chance/favorites': {
    src: '/assets/webp/page_favorites.webp',
    width: 320,
    float: 'center'
  },

  '/dobrology/join': {
    src: '/assets/webp/page_join.webp',
    width: 320,
    float: 'left'
  },
  '/dobrology/support': {
    src: '/assets/webp/page_support.webp',
    width: 320,
    float: 'right'
  },

  '/humans/volunteers': {
    src: '/assets/webp/page_volunteers.webp',
    width: 320,
    float: 'center'
  },

  '/organizations/shelters': {
    src: '/assets/webp/page_shelters.webp',
    width: 320,
    float: 'center'
  },

  '/pets/cats': {
    src: '/assets/webp/page_cats.webp',
    width: 320,
    float: 'left'
  },
  '/pets/dogs': {
    src: '/assets/webp/page_dogs.webp',
    width: 320,
    float: 'right'
  },
  
  '/recommendations/go': {
    src: '/assets/webp/page_go.webp',
    width: 320,
    float: 'center'
  },
  '/recommendations/health': {
    src: '/assets/webp/page_health.webp',
    width: 320,
    float: 'left'
  },
  '/recommendations/trouble': {
    src: '/assets/webp/page_trouble.webp',
    width: 320,
    float: 'right'
  },
  '/recommendations/welfare': {
    src: '/assets/webp/page_welfare.webp',
    width: 320,
    float: 'center'
  },
  
  default: {
    src: '/assets/webp/page_default.webp',
    width: 320,
    float: 'center'
  }
  
}

export function usePageStyle(path) {
  const cleanPath = path.replace(/^\/petly/, '').replace(/\/$/, '')
  if (!cleanPath || cleanPath === '/') {
    return pageImages['/']
  }
  if (pageImages[cleanPath]) {
    return pageImages[cleanPath]
  }
  const matchingKey = Object.keys(pageImages).find(key => 
    key !== 'default' && cleanPath.startsWith(key)
  )
  if (matchingKey) {
    return pageImages[matchingKey]
  }
  return pageImages.default
}