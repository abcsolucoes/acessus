import { useEffect, useState } from 'react'
import { API_URL, authHeaders } from '../../services/api'

// Baixa a foto/PDF de rota já salva como blob autenticado (o endpoint exige Bearer token,
// então não dá pra usar direto num <img src="...">) e informa se é imagem ou não,
// pra decidir entre mostrar uma miniatura ou um link "ver arquivo".
export function useRoutePhoto(candidateId: number | string | undefined, hasPhoto: boolean | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  const [isImage, setIsImage] = useState(false)

  useEffect(() => {
    if (!candidateId || !hasPhoto) {
      setUrl(null)
      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    fetch(`${API_URL}/candidates/${candidateId}/route-photo`, { headers: authHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar foto da rota')
        return res.blob()
      })
      .then(blob => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
        setIsImage(blob.type.startsWith('image/'))
      })
      .catch(() => {
        if (!cancelled) setUrl(null)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [candidateId, hasPhoto])

  return { url, isImage }
}
