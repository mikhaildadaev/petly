import { createContentLoader } from 'vitepress'

export default createContentLoader('/ru/volunteers/*.md', {
  transform(raw) {
    return raw
      .filter(page => !page.url.endsWith('volunteers_index.html'))
      .map(page => ({
        slug: page.url.replace('/ru/volunteers/', '').replace('/', ''),
        uuid: page.frontmatter?.uuid || '',
        name: page.frontmatter?.title || '',
        description: page.frontmatter?.description || '',
        experience: page.frontmatter?.experience || '',
        direction: page.frontmatter?.direction || '',
        image: page.frontmatter?.image || '/placeholder-volunteer.svg'
      }))
  }
})