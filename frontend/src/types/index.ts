/* ============================================================
   TypeScript types do projeto
   Adicione aqui os tipos conforme for criando as páginas.
   ============================================================ */

export type Department = 'TI' | 'RH' | 'DP' | 'OPERACAO'

export type User = {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'RH' | 'OPERACIONAL' | 'DP'
  enabled: boolean
  department: Department | null
}

export type Candidate = {
  id: number
  name: string
  cpf: string
  email: string
  telephone: string
  position: string
  admissionDate: string
  birthDate: string | null
  zipcode: string | null
  addressNumber: string | null
  complement: string | null
  candidateStatus: 'PENDING' | 'UNDER_ANALYSIS' | 'APPROVED' | 'REJECTED'
  formEnabled: boolean
  routeName: string | null
  teamName: string | null
}

export type Contact = {
  resourceName: string
  name: string
  telephone: string
  email: string
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  last: boolean
}

export type Field = {
  id: number
  fieldName: string
  enabled: boolean
  fieldSize: 'MEDIUM' | 'BIG'
  fieldType: 'TEXT' | 'DOC' | 'DATE'
  step: 'personalData' | 'address' | 'docs' | 'dependentsDocs' | 'bankDetails'
  scope: 'ADMISSION' | 'CANDIDATE'
  candidate: { id: number } | null
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export type TicketAttachment = {
  id: number
  fileName: string
  contentType: string
  uploadedAt: string
}

export type Ticket = {
  id: number
  title: string
  description: string
  status: TicketStatus
  createdAt: string
  createdBy: User
  department: Department | null
  assignedTo: User | null
  attachments: TicketAttachment[]
}

export type FieldValue = {
  fieldId: number
  value: string
}

export type FieldValueResponse = {
  fieldId: number
  value: string | null
  fileName: string | null
}

export type Logs = {
  id: number
  userName: string
  description: string
  createdAt: string
}

export type LogsFilter = {
  userName: string
  startDate: string
  endDate: string
}