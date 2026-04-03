'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { VARIATION_STATUS_COLOURS, VARIATION_STATUS_LABELS, VARIATION_TYPE_COLOURS, VARIATION_TYPE_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

interface Props { projectId: string }

interface Variation {
  id: string
  variation_number: number
  type: string
  description: string
  amount: number
  status: string
  approved_date: string | null
  reason: string | null
}

interface Subcontract {
  id: string
  trade: string
}

export function VariationsTab({ projectId }: Props) {
  const [variations, setVariations] = useState<Variation[]>([])
  const [subcontracts, setSubcontracts] = useState<Subcontract[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    type: 'client' as 'client' | 'subcontractor' | 'internal',
    subcontract_id: '',
    description: '',
    reason: '',
    amount: '',
    status: 'pending',
    notes: '',
  })

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('variations').select('*').eq('project_id', projectId).order('variation_number')
    setVariations(data ?? [])
    const { data: subs } = await supabase.from('subcontracts').select('id, trade').eq('project_id', projectId)
    setSubcontracts(subs ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const nextNumber = (variations.length > 0 ? Math.max(...variations.map(v => v.variation_number)) : 0) + 1
    const { error } = await supabase.from('variations').insert({
      project_id: projectId,
      variation_number: nextNumber,
      type: form.type,
      subcontract_id: form.subcontract_id || null,
      description: form.description,
      reason: form.reason || null,
      amount: parseFloat(form.amount) || 0,
      status: form.status,
      notes: form.notes || null,
    })
    if (error) { setError(error.message); setSaving(false); return }
    setShowForm(false)
    setForm({ type: 'client', subcontract_id: '', description: '', reason: '', amount: '', status: 'pending', notes: '' })
    load()
    setSaving(false)
  }

  const approvedTotal = variations.filter(v => v.status === 'approved').reduce((s, v) => s + (v.amount ?? 0), 0)
  const pendingTotal = variations.filter(v => v.status === 'pending').reduce((s, v) => s + (v.amount ?? 0), 0)

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          <Plus className="w-4 h-4" /> New Variation
        </button>
      </div>

      {variations.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Approved</p>
            <p className={`text-xl font-bold mt-0.5 ${approvedTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(approvedTotal)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Pending</p>
            <p className="text-xl font-bold text-amber-700 mt-0.5">{formatCurrency(pendingTotal)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Net Adjustment</p>
            <p className={`text-xl font-bold mt-0.5 ${approvedTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(approvedTotal)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {!variations.length ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No variations yet for this project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Var #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Description</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {variations.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{v.variation_number}</td>
                    <td className="px-4 py-3"><Badge label={VARIATION_TYPE_LABELS[v.type as keyof typeof VARIATION_TYPE_LABELS]} className={VARIATION_TYPE_COLOURS[v.type as keyof typeof VARIATION_TYPE_COLOURS]} /></td>
                    <td className="px-4 py-3 text-gray-700">{v.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${v.amount >= 0 ? 'text-gray-900' : 'text-red-700'}`}>{formatCurrency(v.amount)}</td>
                    <td className="px-4 py-3"><Badge label={VARIATION_STATUS_LABELS[v.status as keyof typeof VARIATION_STATUS_LABELS]} className={VARIATION_STATUS_COLOURS[v.status as keyof typeof VARIATION_STATUS_COLOURS]} /></td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(v.approved_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">New Variation</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof form.type }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                  <option value="client">Client</option>
                  <option value="subcontractor">Subcontractor</option>
                  <option value="internal">Internal</option>
                </select>
              </div>
              {form.type === 'subcontractor' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Subcontract</label>
                  <select value={form.subcontract_id} onChange={e => setForm(f => ({ ...f, subcontract_id: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                    <option value="">— Select —</option>
                    {subcontracts.map(s => <option key={s.id} value={s.id}>{s.trade}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description *</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Reason</label>
                <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount *</label>
                  <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Create Variation'}
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
