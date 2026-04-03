'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

interface Props { projectId: string }

interface Doc {
  id: string
  name: string
  type: string
  discipline: string | null
  revision: string
  status: string
  shared_with_client: boolean
  uploaded_at: string
}

const STATUS_COLOURS = {
  current: 'bg-green-100 text-green-800',
  superseded: 'bg-gray-100 text-gray-500',
  void: 'bg-red-100 text-red-700',
}

export function DocumentsTab({ projectId }: Props) {
  const [documents, setDocuments] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    type: 'drawing' as string,
    discipline: '',
    revision: 'A',
    revision_notes: '',
    shared_with_client: false,
    shared_with_subbies: false,
  })

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('documents').select('*').eq('project_id', projectId).order('uploaded_at', { ascending: false })
    setDocuments(data ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.from('documents').insert({
      project_id: projectId,
      name: form.name,
      type: form.type,
      discipline: form.discipline || null,
      revision: form.revision,
      revision_notes: form.revision_notes || null,
      storage_path: `${projectId}/${form.name}-${form.revision}`,
      status: 'current',
      shared_with_client: form.shared_with_client,
      shared_with_subbies: form.shared_with_subbies,
    })
    if (error) { setError(error.message); setSaving(false); return }
    setShowForm(false)
    setForm({ name: '', type: 'drawing', discipline: '', revision: 'A', revision_notes: '', shared_with_client: false, shared_with_subbies: false })
    load()
    setSaving(false)
  }

  const current = documents.filter(d => d.status === 'current').length

  if (loading) return <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {documents.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">{current} current document{current !== 1 ? 's' : ''}</p>
          </div>
        )}
        {!documents.length ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No documents yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Discipline</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Rev</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map(doc => (
                  <tr key={doc.id} className={`hover:bg-gray-50 transition-colors ${doc.status !== 'current' ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{doc.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{DOCUMENT_TYPE_LABELS[doc.type as keyof typeof DOCUMENT_TYPE_LABELS] ?? doc.type}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{doc.discipline ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{doc.revision}</td>
                    <td className="px-4 py-3"><Badge label={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)} className={STATUS_COLOURS[doc.status as keyof typeof STATUS_COLOURS]} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{doc.shared_with_client ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(doc.uploaded_at)}</td>
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
              <h2 className="text-base font-semibold text-gray-900">Add Document</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Document Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" placeholder="e.g. Ground Floor Plan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                    <option value="drawing">Drawing</option>
                    <option value="specification">Specification</option>
                    <option value="rfi">RFI</option>
                    <option value="contract">Contract</option>
                    <option value="report">Report</option>
                    <option value="photo">Photo</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Revision</label>
                  <input value={form.revision} onChange={e => setForm(f => ({ ...f, revision: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" placeholder="A" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Discipline</label>
                <select value={form.discipline} onChange={e => setForm(f => ({ ...f, discipline: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900">
                  <option value="">— Select —</option>
                  <option value="Architectural">Architectural</option>
                  <option value="Structural">Structural</option>
                  <option value="Civil">Civil</option>
                  <option value="Hydraulic">Hydraulic</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Revision Notes</label>
                <input value={form.revision_notes} onChange={e => setForm(f => ({ ...f, revision_notes: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.shared_with_client} onChange={e => setForm(f => ({ ...f, shared_with_client: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-700">Share with client</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.shared_with_subbies} onChange={e => setForm(f => ({ ...f, shared_with_subbies: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-700">Share with subcontractors</span>
                </label>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Add Document'}
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
