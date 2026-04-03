'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Contact } from '@/types/database'

const TYPE_COLOURS = {
  client: 'bg-blue-100 text-blue-800',
  subcontractor: 'bg-purple-100 text-purple-800',
  supplier: 'bg-amber-100 text-amber-800',
  other: 'bg-gray-100 text-gray-700',
}

const TYPE_LABELS = {
  client: 'Client',
  subcontractor: 'Subcontractor',
  supplier: 'Supplier',
  other: 'Other',
}

const FILTER_OPTIONS = ['all', 'client', 'subcontractor', 'supplier', 'other'] as const

interface Props {
  contacts: Contact[]
}

export function ContactsClient({ contacts }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | Contact['type']>('all')
  const [selected, setSelected] = useState<Contact | null>(null)

  const filtered = contacts.filter(c => {
    const matchesType = filter === 'all' || c.type === filter
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          <Plus className="w-4 h-4" />
          New Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter === f
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No contacts found
                  </td>
                </tr>
              ) : filtered.map(contact => (
                <tr
                  key={contact.id}
                  onClick={() => setSelected(contact)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{contact.name}</td>
                  <td className="px-4 py-3 text-gray-600">{contact.company ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge
                      label={TYPE_LABELS[contact.type]}
                      className={TYPE_COLOURS[contact.type]}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contact.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{contact.phone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                  {selected.company && <p className="text-sm text-gray-500">{selected.company}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="mt-2">
                <Badge label={TYPE_LABELS[selected.type]} className={TYPE_COLOURS[selected.type]} />
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone },
                { label: 'ABN', value: selected.abn },
                { label: 'Address', value: selected.address },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm text-gray-700">{value}</p>
                </div>
              ) : null)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
