// Custom hook — fetches and returns crime list with loading/error state
import { useState, useEffect } from 'react'
import { getCrimes } from '../services/crimeService'

export function useCrimes(params = {}) {
  const [crimes, setCrimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCrimes(params)
      .then((res) => setCrimes(res.data))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { crimes, loading, error }
}
