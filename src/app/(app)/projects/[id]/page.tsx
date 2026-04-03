import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { STATUS_COLOURS, STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CostingTab } from './_components/CostingTab'
import { SubcontractsTab } from './_components/SubcontractsTab'
import { PurchaseOrdersTab } from './_components/PurchaseOrdersTab'
import { ClaimsTab } from './_components/ClaimsTab'
import { VariationsTab } from './_components/VariationsTab'
import { DocumentsTab } from './_components/DocumentsTab'
import { RFIsTab } from './_components/RFIsTab'
import { MapPin, Calendar, DollarSign } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('role').eq('id', authUser.id).single()
  const isOwnerOrOffice = currentUser?.role === 'owner' || currentUser?.role === 'office'

  const { data: project } = await supabase
    .from('projects')
    .select('*, client:contacts(name, company, email, phone)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: costItems } = isOwnerOrOffice
    ? await supabase.from('cost_items').select('*, category:cost_categories(name, sort_order)').eq('project_id', id)
    : { data: [] }

  const totalBudgeted = costItems?.reduce((s, i) => s + (i.budgeted ?? 0), 0) ?? 0
  const totalActual = costItems?.reduce((s, i) => s + (i.actual ?? 0), 0) ?? 0
  const variance = totalBudgeted - totalActual

  const { data: variations } = isOwnerOrOffice
    ? await supabase.from('variations').select('amount, status').eq('project_id', id)
    : { data: [] }

  const approvedVariationsTotal = variations?.filter(v => v.status === 'approved').reduce((s, v) => s + (v.amount ?? 0), 0) ?? 0
  const adjustedContractValue = (project.contract_value ?? 0) + approvedVariationsTotal

  const { data: claims } = isOwnerOrOffice
    ? await supabase.from('progress_claims').select('amount_claimed, amount_certified, amount_paid, status').eq('project_id', id)
    : { data: [] }

  const totalClaimed = claims?.reduce((s, c) => s + (c.amount_claimed ?? 0), 0) ?? 0
  const totalCertified = claims?.reduce((s, c) => s + (c.amount_certified ?? 0), 0) ?? 0

  const { data: openRFIs } = await supabase.from('rfis').select('id').eq('project_id', id).eq('status', 'open')
  const { data: pendingVars } = isOwnerOrOffice
    ? await supabase.from('variations').select('id').eq('project_id', id).eq('status', 'pending')
    : { data: [] }
  const { data: openPOs } = isOwnerOrOffice
    ? await supabase.from('purchase_orders').select('id').eq('project_id', id).neq('status', 'complete')
    : { data: [] }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    ...(isOwnerOrOffice ? [
      { key: 'costing', label: 'Job Costing' },
      { key: 'subcontracts', label: 'Subcontracts' },
      { key: 'purchase-orders', label: 'Purchase Orders' },
      { key: 'claims', label: 'Progress Claims' },
      { key: 'variations', label: 'Variations' },
      { key: 'documents', label: 'Documents' },
      { key: 'rfis', label: 'RFIs' },
    ] : []),
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <Badge
            label={STATUS_LABELS[project.status as keyof typeof STATUS_LABELS]}
            className={STATUS_COLOURS[project.status as keyof typeof STATUS_COLOURS]}
          />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{project.address}</span>
          {project.start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(project.start_date)} – {formatDate(project.end_date)}
            </span>
          )}
          {project.contract_value && (
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <DollarSign className="w-3.5 h-3.5" />
              {formatCurrency(project.contract_value)}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <Link
            key={t.key}
            href={`/projects/${id}?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === t.key
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isOwnerOrOffice && (
            <>
              <StatCard label="Total Budget" value={formatCurrency(totalBudgeted)} />
              <StatCard label="Spent to Date" value={formatCurrency(totalActual)} />
              <StatCard
                label="Variance"
                value={formatCurrency(Math.abs(variance))}
                valueClass={variance >= 0 ? 'text-green-700' : 'text-red-700'}
                sub={variance >= 0 ? 'Under budget' : 'Over budget'}
              />
            </>
          )}
          {isOwnerOrOffice && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Financial Summary</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Contract Value</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(project.contract_value)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Approved Variations</p>
                  <p className={`text-lg font-bold ${approvedVariationsTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(approvedVariationsTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Adjusted Contract Value</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(adjustedContractValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Claimed</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(totalClaimed)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Certified</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(totalCertified)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Balance Remaining</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(adjustedContractValue - totalCertified)}</p>
                </div>
              </div>
            </div>
          )}
          {((openRFIs?.length ?? 0) > 0 || (pendingVars?.length ?? 0) > 0 || (openPOs?.length ?? 0) > 0) ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Activity</p>
              <div className="flex flex-wrap gap-4">
                {(openRFIs?.length ?? 0) > 0 && <p className="text-sm text-gray-600"><span className="font-semibold text-amber-700">{openRFIs?.length}</span> open RFI{openRFIs?.length !== 1 ? 's' : ''}</p>}
                {(pendingVars?.length ?? 0) > 0 && <p className="text-sm text-gray-600"><span className="font-semibold text-amber-700">{pendingVars?.length}</span> pending variation{pendingVars?.length !== 1 ? 's' : ''}</p>}
                {(openPOs?.length ?? 0) > 0 && <p className="text-sm text-gray-600"><span className="font-semibold text-blue-700">{openPOs?.length}</span> open PO{openPOs?.length !== 1 ? 's' : ''}</p>}
              </div>
            </div>
          ) : null}
          {project.client && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Client</p>
              <p className="font-semibold text-gray-900">{project.client.name}</p>
              {project.client.company && <p className="text-sm text-gray-500">{project.client.company}</p>}
              {project.client.email && <p className="text-sm text-gray-500">{project.client.email}</p>}
              {project.client.phone && <p className="text-sm text-gray-500">{project.client.phone}</p>}
            </div>
          )}
          {project.description && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'costing' && isOwnerOrOffice && (
        <CostingTab projectId={id} />
      )}

      {tab === 'subcontracts' && isOwnerOrOffice && (
        <SubcontractsTab projectId={id} />
      )}

      {tab === 'purchase-orders' && isOwnerOrOffice && (
        <PurchaseOrdersTab projectId={id} />
      )}

      {tab === 'claims' && isOwnerOrOffice && (
        <ClaimsTab projectId={id} />
      )}

      {tab === 'variations' && isOwnerOrOffice && (
        <VariationsTab projectId={id} />
      )}

      {tab === 'documents' && (
        <DocumentsTab projectId={id} />
      )}

      {tab === 'rfis' && (
        <RFIsTab projectId={id} />
      )}
    </div>
  )
}

function StatCard({ label, value, valueClass, sub }: { label: string; value: string; valueClass?: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueClass ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
