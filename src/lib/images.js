// Shrinks photos before storing so a few dozen fit in browser storage.
export const compress = (file, max = 1200) => new Promise((resolve, reject) => {
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    const s = Math.min(1, max / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = Math.round(img.width * s); c.height = Math.round(img.height * s)
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    URL.revokeObjectURL(url)
    resolve(c.toDataURL('image/jpeg', 0.75))
  }
  img.onerror = reject
  img.src = url
})
