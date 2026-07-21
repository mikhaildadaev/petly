const MEDIA_CONFIG = {
  audio: {
    folder: 'audios',
    extensions: ['weba', 'mp3'],
    placeholder: 'placeholder-audio'
  },
  image: {
    folder: 'images',
    extensions: ['webp', 'svg'],
    placeholder: 'placeholder-image'
  },
  photos: {
    folder: 'photos',
    extensions: ['webp', 'jpg', 'jpeg'],
    placeholder: 'placeholder-photos'
  },
  video: {
    folder: 'videos',
    extensions: ['webm', 'mp4'],
    placeholder: 'placeholder-video'
  }
}
const getExtensionFromPath = (path) => {
  if (!path) return null
  const match = path.match(/\.([^./?#]+)$/)
  return match ? match[1].toLowerCase() : null
}

export const useUrlMedia = (mediaPath, format = 'image') => {
  const baseUrl = import.meta.env.BASE_URL
  const config = MEDIA_CONFIG[format] || MEDIA_CONFIG.image
  if (mediaPath) {
    if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
      return mediaPath
    }
    let fullPath = mediaPath
    if (mediaPath.startsWith('/')) {
      fullPath = `${baseUrl}${mediaPath.slice(1)}`
    }
    const ext = getExtensionFromPath(fullPath)
    if (ext && config.extensions.includes(ext)) {
      return fullPath
    }
    return getPlaceholder(format)
  }
  return getPlaceholder(format)
}
export const getPlaceholder = (format = 'image') => {
  const baseUrl = import.meta.env.BASE_URL
  const config = MEDIA_CONFIG[format] || MEDIA_CONFIG.image
  return `${baseUrl}${config.folder}/${config.placeholder}.${config.extensions[0]}`
}
export const getSupportedExtensions = (format = 'image') => {
  const config = MEDIA_CONFIG[format] || MEDIA_CONFIG.image
  return config.extensions
}
export const isExtensionSupported = (format, extension) => {
  const config = MEDIA_CONFIG[format] || MEDIA_CONFIG.image
  return config.extensions.includes(extension)
}