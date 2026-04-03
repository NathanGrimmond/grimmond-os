'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { RFI_PRIORITY_COLOURS, RFI_PRIORITY_LABELS, RFI_STATUS_COLOURS, RFI_STATUS_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

interface Props { projectId: string }

interface RFI {
  id: string
  rfi_number: number
  subject: string
  description: string
  priority: string
  status: string
  due_date: string | null
  answered_date: string | null
}

export function RFIsTab({ projectId }: Props) {
  const [rfis, setRfis] = useState<RFI[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    due_date: '',
  })

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('rfis').select('*').eq('project_id', projectId).order('rfi_number')
    setRfis(data ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const nextNumber = (rfis.length > 0 ? Math.max(...rfis.map(r => r.rfi_number)) : 0) + 1
    const { error } = await supabase.from('rfis').insert({
      project_id: projectId,
      rfi_number: nextNumber,
      subject: form.subject,
      description: form.description,
      priority: form.priority,
      due_date: form.due_date || null,
      status: 'open',
    })
    if (error) { setError(error.message); setSaving(false); return }
    setShowForm(false)
    setForm({ subject: '', description: '', priority: 'normal', due_date: '' })
    load()
    setSaving(false)
  }

  const open = rfis.filter(r => r.status === 'open').length

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          <Plus className="w-4 h-4" /> New RFI
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {rfis.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{rfis.length} RFI{rfis.length !== 1 ? 's' : ''}</p>
            {open > 0 && <p className="text-xs font-medium text-amber-700">{open} open</p>}
          </div>
        )}
        {!rfis.length ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No RFIs raised yet for this project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">RFI #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Due</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Answered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rfis.map(rfi => (
                  <tr key={rfi.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{rfi.rfi_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{rfi.subject}</td>
                    <td className="px-4 py-3"><Badge label={RFI_PRIORITY_LABELS[rfi.priority as keyof typeof RFI_PRIORITY_LABELS]} className={RFI_PRIORITY_COLOURS[rfi.priority as keyof typeof RFI_PRIORITY_COLOURS]} /></td>
                    <td className="px-4 py-3"><Badge label={RFI_STATUS_LABELS[rfi.status as keyof typeof RFI_STATUS_LABELS]} className={RFI_STATUS_COLOURS[rfi.status as keyof typeof RFI_STATUS_COLOURS]} /></td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(rfi.due_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(rfi.answered_date)}</td>
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
              <h2 className="text-base font-semibold text-gray-900">New RFI</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject *</label>
                <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Submit RFI'}
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
