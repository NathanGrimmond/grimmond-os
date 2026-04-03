export interface Organisation {
  id: string
  name: string
  abn: string | null
  logo_url: string | null
  created_at: string
}

export interface User {
  id: string
  org_id: string
  name: string
  email: string
  role: 'owner' | 'office' | 'supervisor' | 'client'
  created_at: string
}

export interface Contact {
  id: string
  org_id: string
  type: 'client' | 'subcontractor' | 'supplier' | 'other'
  name: string
  company: string | null
  email: string | null
  phone: string | null
  abn: string | null
  address: string | null
  created_at: string
}

export interface Project {
  id: string
  org_id: string
  client_contact_id: string | null
  name: string
  address: string
  status: 'tender' | 'active' | 'practical_completion' | 'defects' | 'complete' | 'on_hold'
  contract_value: number | null
  start_date: string | null
  end_date: string | null
  description: string | null
  created_at: string
  client?: Contact
}

export interface CostCategory {
  id: string
  project_id: string
  name: string
  sort_order: number
}

export interface CostItem {
  id: string
  project_id: string
  category_id: string | null
  description: string
  budgeted: number
  actual: number
  committed: number
  notes: string | null
  created_at: string
  category?: CostCategory
}

export interface Subcontract {
  id: string
  project_id: string
  contact_id: string | null
  trade: string
  description: string | null
  value: number | null
  status: 'draft' | 'sent' | 'executed' | 'complete' | 'disputed'
  executed_date: string | null
  notes: string | null
  created_at: string
  contact?: Contact
}

export interface PurchaseOrder {
  id: string
  project_id: string
  subcontract_id: string | null
  po_number: string
  description: string
  amount: number
  status: 'draft' | 'issued' | 'acknowledged' | 'complete' | 'disputed'
  issued_date: string | null
  due_date: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  subcontract?: Subcontract
}

export interface ClaimMilestone {
  id: string
  project_id: string
  name: string
  percentage: number
  sort_order: number
  completed: boolean
  completed_date: string | null
}

export interface ProgressClaim {
  id: string
  project_id: string
  claim_number: number
  period_end: string
  status: 'draft' | 'submitted' | 'certified' | 'paid' | 'disputed'
  amount_claimed: number
  amount_certified: number | null
  amount_paid: number | null
  submitted_date: string | null
  certified_date: string | null
  paid_date: string | null
  notes: string | null
  created_at: string
  line_items?: ClaimLineItem[]
}

export interface ClaimLineItem {
  id: string
  claim_id: string
  cost_item_id: string | null
  milestone_id: string | null
  description: string
  scheduled_value: number
  percent_complete: number
  amount_this_claim: number
  amount_previously_claimed: number
}

export interface Document {
  id: string
  project_id: string
  name: string
  type: 'drawing' | 'specification' | 'rfi' | 'contract' | 'report' | 'photo' | 'other'
  discipline: string | null
  revision: string
  revision_notes: string | null
  storage_path: string
  file_size: number | null
  file_type: string | null
  status: 'current' | 'superseded' | 'void'
  shared_with_client: boolean
  shared_with_subbies: boolean
  uploaded_by: string | null
  uploaded_at: string
}

export interface RFI {
  id: string
  project_id: string
  rfi_number: number
  subject: string
  description: string
  status: 'open' | 'answered' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assigned_to: string | null
  raised_by: string | null
  due_date: string | null
  answered_date: string | null
  answer: string | null
  created_at: string
}

export interface Variation {
  id: string
  project_id: string
  subcontract_id: string | null
  variation_number: number
  type: 'client' | 'subcontractor' | 'internal'
  description: string
  reason: string | null
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'on_hold'
  initiated_by: string | null
  approved_by: string | null
  approved_date: string | null
  notes: string | null
  created_at: string
}

export interface Tender {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'draft' | 'open' | 'closed' | 'awarded'
  issue_date: string | null
  close_date: string | null
  awarded_to: string | null
  awarded_date: string | null
  notes: string | null
  created_at: string
  invitees?: TenderInvitee[]
  documents?: TenderDocument[]
  project?: { name: string }
}

export interface TenderInvitee {
  id: string
  tender_id: string
  contact_id: string
  email: string
  notified_at: string | null
  viewed_at: string | null
  contact?: Contact
}

export interface TenderDocument {
  id: string
  tender_id: string
  name: string
  storage_path: string
  version: number
  created_at: string
}

export interface TenderChange {
  id: string
  tender_id: string
  change_description: string
  changed_by: string | null
  notifications_sent: boolean
  created_at: string
}
