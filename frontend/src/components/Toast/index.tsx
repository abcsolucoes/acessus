import { useEffect } from 'react'
import styles from './Toast.module.css'

type Props = {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
  duration?: number  // ms, default 3000
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`${styles.toast} ${type === 'error' ? styles.error : styles.success}`}>
      <span>{message}</span>
      <button className={styles.close} onClick={onClose}>✕</button>
    </div>
  )
}
