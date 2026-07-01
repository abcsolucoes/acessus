import { useEffect, useState } from 'react'
import { apiFetch, authHeaders } from '../../services/api'

interface CepResult {
  address: string
  district: string
  city: string
  addressState: string
}

export function useCepLookup(zipcode: string) {
  const [result, setResult] = useState<CepResult>({ address: '', district: '', city: '', addressState: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const digits = zipcode.replace(/\D/g, '')
    if (digits.length !== 8) return

    setLoading(true)
    setError('')
    apiFetch<Record<string, string>>(`/dysrup/cep?cep=${digits}`, { headers: authHeaders() })
      .then(data => {
        setResult({
          address: data.logradouro || '',
          district: data.bairro || '',
          city: data.localidade || '',
          addressState: data.uf || '',
        })
      })
      .catch(() => setError('CEP não encontrado'))
      .finally(() => setLoading(false))
  }, [zipcode])

  return { ...result, loading, error }
}
