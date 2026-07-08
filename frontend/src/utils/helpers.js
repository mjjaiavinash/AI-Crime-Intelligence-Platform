// Utility functions: date formatting, coordinate helpers, color mapping by crime type

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
