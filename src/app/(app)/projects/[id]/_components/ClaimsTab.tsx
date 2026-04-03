'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { CLAIM_STATUS_COLOURS, CLAIM_STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

interface Props { projectId: string }

interface Claim {
  id: string
  claim_number: number
  period_end: string
  amount_claimed: number
  amount_certified: number | null
  amount_paid: number | null
  status: string
  submitted_date: string | null
}

interface Milestone {
  id: string
  name: string
  percentage: number
  completed: boolean
  completed_date: string | null
}

const DEFAULT_MILESTONES = [
  { name: 'Site Establishment', percentage: 2 },
  { name: 'Demolition / Excavation', percentage: 5 },
  { name: 'Slab Down', percentage: 15 },
  { name: 'Frame Complete', percentage: 20 },
  { name: 'Lock Up', percentage: 20 },
  { name: 'Fixing Stage', percentage: 15 },
  { name: 'Practical Completion', percentage: 18 },
  { name: 'Final', percentage: 5 },
]

export function ClaimsTab({ projectId }: Props) {
  const [claims, setClaims] = useState<Claim[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    period_end: '',
    amount_claimed: '',
    notes: '',
    status: 'draft',
  })

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: claimData } = await supabase.from('progress_claims').select('*').eq('project_id', projectId).order('claim_number')
    setClaims(claimData ?? [])
    const { data: milestoneData } = await supabase.from('claim_milestones').select('*').eq('project_id', projectId).order('sort_order')
    setMilestones(milestoneData ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const nextNumber = (claims.length > 0 ? Math.max(...claims.map(c => c.claim_number)) : 0) + 1
    const { error } = await supabase.from('progress_claims').insert({
      project_id: projectId,
      claim_number: nextNumber,
      period_end: form.period_end,
      amount_claimed: parseFloat(form.amount_claimed) || 0,
      status: form.status,
      notes: form.notes || null,
    })
    if (error) { setError(error.message); setSaving(false); return }
    setShowForm(false)
    setForm({ period_end: '', amount_claimed: '', notes: '', status: 'draft' })
    load()
    setSaving(false)
  }

  const totalClaimed = claims.reduce((s, c) => s + (c.amount_claimed ?? 0), 0)
  const totalCertified = claims.reduce((s, c) => s + (c.amount_certified ?? 0), 0)
  const totalPaid = claims.reduce((s, c) => s + (c.amount_paid ?? 0), 0)

  const displayMilestones = milestones.length > 0 ? milestones : DEFAULT_MILESTONES

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Milestones */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Claim Milestones
          {milestones.length === 0 && <span className="ml-2 text-xs font-normal text-gray-400">(defaults — initialise from Supabase after running Phase 2 schema)</span>}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayMilestones.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg border ${'completed' in m && m.completed ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
              <p className="text-xs font-medium text-gray-700">{m.name}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{m.percentage}%</p>
              {'completed' in m && m.completed ? <p className="text-xs text-green-700 mt-0.5">✓ {formatDate((m as Milestone).completed_date)}</p> : null}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      {claims.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Total Claimed</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalClaimed)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Total Certified</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalCertified)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Total Paid</p>
            <p className="text-xl font-bold text-green-700 mt-0.5">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      )}

      {/* Claims list */}
      <div>
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
            <Plus className="w-4 h-4" /> New Claim
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {!claims.length ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No progress claims yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Claim #</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Period End</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Claimed</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Certified</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Paid</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.map(claim => (
                    <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">#{claim.claim_number}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(claim.period_end)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(claim.amount_claimed)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(claim.amount_certified)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(claim.amount_paid)}</td>
                      <td className="px-4 py-3"><Badge label={CLAIM_STATUS_LABELS[claim.status as keyof typeof CLAIM_STATUS_LABELS]} className={CLAIM_STATUS_COLOURS[claim.status as keyof typeof CLAIM_STATUS_COLOURS]} /></td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(claim.submitted_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">New Progress Claim</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Period End Date *</label>
                <input required type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount Claimed *</label>
                <input required type="number" step="0.01" value={form.amount_claimed} onChange={e => setForm(f => ({ ...f, amount_claimed: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="certified">Certified</option>
                  <option value="paid">Paid</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Create Claim'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
