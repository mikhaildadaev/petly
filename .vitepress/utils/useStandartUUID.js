export const useStandartUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return null
  const hex = uuid.replace(/-/g, '')
  if (!/^[0-9a-fA-F]{32}$/.test(hex)) return null
  return hex
}
export const useShortUUID = (uuid) => {
  if (!uuid) return null
  try {
    const hex = uuid.replace(/-/g, '')
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    return base64.split('').reverse().join('')
  } catch (error) {
    return null
  }
}