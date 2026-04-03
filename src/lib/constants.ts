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

export const PO_STATUS_COLOURS = {
  draft: 'bg-gray-100 text-gray-700',
  issued: 'bg-blue-100 text-blue-800',
  acknowledged: 'bg-green-100 text-green-800',
  complete: 'bg-teal-100 text-teal-800',
  disputed: 'bg-red-100 text-red-800',
} as const

export const PO_STATUS_LABELS = {
  draft: 'Draft',
  issued: 'Issued',
  acknowledged: 'Acknowledged',
  complete: 'Complete',
  disputed: 'Disputed',
} as const

export const CLAIM_STATUS_COLOURS = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-800',
  certified: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  disputed: 'bg-red-100 text-red-800',
} as const

export const CLAIM_STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  certified: 'Certified',
  paid: 'Paid',
  disputed: 'Disputed',
} as const

export const VARIATION_STATUS_COLOURS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  on_hold: 'bg-gray-100 text-gray-700',
} as const

export const VARIATION_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  on_hold: 'On Hold',
} as const

export const VARIATION_TYPE_COLOURS = {
  client: 'bg-purple-100 text-purple-800',
  subcontractor: 'bg-amber-100 text-amber-800',
  internal: 'bg-gray-100 text-gray-700',
} as const

export const VARIATION_TYPE_LABELS = {
  client: 'Client',
  subcontractor: 'Subcontractor',
  internal: 'Internal',
} as const

export const TENDER_STATUS_COLOURS = {
  draft: 'bg-gray-100 text-gray-700',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-amber-100 text-amber-800',
  awarded: 'bg-blue-100 text-blue-800',
} as const

export const TENDER_STATUS_LABELS = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Closed',
  awarded: 'Awarded',
} as const

export const RFI_PRIORITY_COLOURS = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-amber-100 text-amber-800',
  normal: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-700',
} as const

export const RFI_PRIORITY_LABELS = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
} as const

export const RFI_STATUS_COLOURS = {
  open: 'bg-amber-100 text-amber-800',
  answered: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
} as const

export const RFI_STATUS_LABELS = {
  open: 'Open',
  answered: 'Answered',
  closed: 'Closed',
} as const

export const DOCUMENT_TYPE_LABELS = {
  drawing: 'Drawing',
  specification: 'Specification',
  rfi: 'RFI',
  contract: 'Contract',
  report: 'Report',
  photo: 'Photo',
  other: 'Other',
} as const
