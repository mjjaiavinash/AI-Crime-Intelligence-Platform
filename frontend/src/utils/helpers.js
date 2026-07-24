// Utility functions: date formatting, coordinate helpers, color mapping by crime type

// Fix garbled UTF-8 characters caused by latin1/utf8 encoding mismatch
export const cleanText = (str) => {
  if (!str) return str
  return str
    .replace(/ÔÇö/g, '\u2014')
    .replace(/ÔÇô/g, '\u2013')
    .replace(/â€"/g, '\u2014')
    .replace(/â€“/g, '\u2013')
    .replace(/â€œ/g, '\u201c')
    .replace(/â€/g, '\u201d')
    .replace(/â€™/g, '\u2019')
    .replace(/â€˜/g, '\u2018')
    .replace(/â€¦/g, '\u2026')
    .replace(/Â·/g, '\u00b7')
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { dateStyle: 'medium' })

export const crimeTypeColor = {
  robbery: '#e63946',
  theft: '#f4a261',
  assault: '#e76f51',
  fraud: '#457b9d',
  homicide: '#1d3557',
}

export const getCrimeColor = (type) => crimeTypeColor[type] ?? '#6b7280'
