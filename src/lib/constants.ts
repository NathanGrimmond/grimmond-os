export const STATUS_COLOURS = {
  tender: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  practical_completion: 'bg-blue-100 text-blue-800',
  defects: 'bg-orange-100 text-orange-800',
  complete: 'bg-gray-100 text-gray-700',
  on_hold: 'bg-red-100 text-red-800',
} as const

export const STATUS_LABELS = {
  tender: 'Tender',
  active: 'Active',
  practical_completion: 'Practical Completion',
  defects: 'Defects',
  complete: 'Complete',
  on_hold: 'On Hold',
} as const

export const ROLE_LABELS = {
  owner: 'Owner',
  office: 'Office',
  supervisor: 'Site Supervisor',
  client: 'Client',
} as const

export const SUBCONTRACT_STATUS_COLOURS = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-amber-100 text-amber-800',
  executed: 'bg-green-100 text-green-800',
  complete: 'bg-blue-100 text-blue-800',
  disputed: 'bg-red-100 text-red-800',
} as const

export const SUBCONTRACT_STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Sent',
  executed: 'Executed',
  complete: 'Complete',
  disputed: 'Disputed',
} as const
