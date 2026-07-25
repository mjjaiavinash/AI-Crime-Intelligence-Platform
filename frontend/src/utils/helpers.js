// Utility functions: date formatting, coordinate helpers, color mapping by crime type

// Fix garbled UTF-8 characters caused by latin1/utf8 encoding mismatch
export const cleanText = (str) => {
  if (!str) return str
  return str
    // Em dash variants
    .replace(/ÔÇö/g, '\u2014')
    .replace(/ÔÇÖ/g, '\u2014')
    .replace(/â€"/g, '\u2014')
    .replace(/â€\u201d/g, '\u2014')
    // En dash variants
    .replace(/ÔÇô/g, '\u2013')
    .replace(/â€"/g, '\u2013')
    // Smart double quotes
    .replace(/â€œ/g, '\u201c')
    .replace(/â€/g, '\u201d')
    // Smart single quotes / apostrophe
    .replace(/â€™/g, '\u2019')
    .replace(/â€˜/g, '\u2018')
    .replace(/ÔÇÿ/g, '\u2019')
    .replace(/ÔÇÜ/g, '\u2018')
    // Ellipsis
    .replace(/â€¦/g, '\u2026')
    // Middle dot
    .replace(/Â·/g, '\u00b7')
    // Common accented chars misread as latin1
    .replace(/Ã©/g, '\u00e9')
    .replace(/Ã /g, '\u00e0')
    .replace(/Ã¨/g, '\u00e8')
    .replace(/Ã¢/g, '\u00e2')
    .replace(/Ã®/g, '\u00ee')
    .replace(/Ã´/g, '\u00f4')
    .replace(/Ã»/g, '\u00fb')
    .replace(/Ã§/g, '\u00e7')
    // Strip remaining stray Ã and Â prefixes
    .replace(/Ã./g, '')
    .replace(/Â/g, '')
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
