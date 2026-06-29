/* ============================================================
   Funções utilitárias de formatação e validação
   ============================================================ */

// ── Formatação ─────────────────────────────────────────────

/** "2025-12-31" → "31/12/2025" */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

/** "2026-06-03T09:41:00" → "03/06/2026 às 09:41" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const date = d.toLocaleDateString('pt-BR')          // 03/06/2026
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) // 09:41
  return `${date} às ${time}`
}

/** "12345678900" → "123.456.789-00" */
export function formatCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/** "(11) 99999-0000" — aplica máscara de telefone */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

// ── Validação ──────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidCpf(raw: string): boolean {
  const cpf = raw.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += +cpf[i] * (10 - i)
  let rem = (sum * 10) % 11
  if (rem === 10) rem = 0
  if (rem !== +cpf[9]) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += +cpf[i] * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10) rem = 0
  return rem === +cpf[10]
}

export function waNumero(telephone: string): string {
    const digits = telephone.replace(/\D/g, '')
    return digits.startsWith('55') ? digits : `55${digits}`
}