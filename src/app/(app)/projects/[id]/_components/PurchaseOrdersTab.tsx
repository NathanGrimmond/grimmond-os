'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { PO_STATUS_COLOURS, PO_STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

interface Props { projectId: string }

interface PO {
  id: string
  po_number: string
  description: string
  amount: number
  status: string
  issued_date: string | null
  due_date: string | null
  notes: string | null
  subcontract?: { trade: string; contact?: { name: string; company: string | null } | null } | null
}

interface Subcontract {
  id: string
  trade: string
  contact?: { name: string; company: string | null } | null
}

export function PurchaseOrdersTab({ projectId }: Props) {
  const [pos, setPos] = useState<PO[]>([])
  const [subcontracts, setSubcontracts] = useState<Subcontract[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    po_number: '',
    subcontract_id: '',
    description: '',
    amount: '',
    status: 'draft',
    issued_date: '',
    due_date: '',
    notes: '',
  })

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('purchase_orders')
      .select('*, subcontract:subcontracts(trade, contact:contacts(name, company))')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setPos(data ?? [])

    const { data: subs } = await supabase
      .from('subcontracts')
      .select('id, trade, contact:contacts(name, company)')
      .eq('project_id', projectId)
    setSubcontracts((subs ?? []) as unknown as Subcontract[])
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.from('purchase_orders').insert({
      project_id: projectId,
      po_number: form.po_number,
      subcontract_id: form.subcontract_id || null,
      description: form.description,
      amount: parseFloat(form.amount) || 0,
      status: form.status,
      issued_date: form.issued_date || null,
      due_date: form.due_date || null,
      notes: form.notes || null,
    })
    if (error) { setError(error.message); setSaving(false); return }
    setShowForm(false)
    setForm({ po_number: '', subcontract_id: '', description: '', amount: '', status: 'draft', issued_date: '', due_date: '', notes: '' })
    load()
    setSaving(false)
  }

  const total = pos.reduce((s, p) => s + (p.amount ?? 0), 0)

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {pos.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{pos.length} purchase order{pos.length !== 1 ? 's' : ''}</p>
            <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</p>
          </div>
        )}
        {!pos.length ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No purchase orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">PO Number</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Subcontract</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Issued</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pos.map(po => (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{po.po_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{po.description}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {po.subcontract ? `${po.subcontract.trade}${po.subcontract.contact ? ` — ${po.subcontract.contact.company ?? po.subcontract.contact.name}` : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(po.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge label={PO_STATUS_LABELS[po.status as keyof typeof PO_STATUS_LABELS]} className={PO_STATUS_COLOURS[po.status as keyof typeof PO_STATUS_COLOURS]} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(po.issued_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(po.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">New Purchase Order</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">PO Number *</label>
                  <input required value={form.po_number} onChange={e => setForm(f => ({ ...f, po_number: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" placeholder="PO-001" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Description *</label>
                  <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Subcontract</label>
                  <select value={form.subcontract_id} onChange={e => setForm(f => ({ ...f, subcontract_id: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                    <option value="">— None —</option>
                    {subcontracts.map(s => <option key={s.id} value={s.id}>{s.trade}{s.contact ? ` — ${s.contact.company ?? s.contact.name}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount *</label>
                  <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                    <option value="draft">Draft</option>
                    <option value="issued">Issued</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="complete">Complete</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Issued Date</label>
                  <input type="date" value={form.issued_date} onChange={e => setForm(f => ({ ...f, issued_date: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
                  <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Create PO'}
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
