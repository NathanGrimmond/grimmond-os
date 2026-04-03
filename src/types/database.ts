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
