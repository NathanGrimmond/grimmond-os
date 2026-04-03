import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { TENDER_STATUS_COLOURS, TENDER_STATUS_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function TenderDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: tender } = await supabase
    .from('tenders')
    .select('*, project:projects(name, address)')
    .eq('id', id)
    .single()

  if (!tender) notFound()

  const { data: invitees } = await supabase
    .from('tender_invitees')
    .select('*, contact:contacts(name, company)')
    .eq('tender_id', id)

  const { data: tenderDocs } = await supabase
    .from('tender_documents')
    .select('*')
    .eq('tender_id', id)
    .order('created_at', { ascending: false })

  const { data: changes } = await supabase
    .from('tender_changes')
    .select('*')
    .eq('tender_id', id)
    .order('created_at', { ascending: false })

  const unnotifiedChanges = changes?.filter(c => !c.notifications_sent).length ?? 0

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: `Documents (${tenderDocs?.length ?? 0})` },
    { key: 'invitees', label: `Invitees (${invitees?.length ?? 0})` },
    { key: 'changes', label: 'Change Log' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              <Link href="/tenders" className="hover:text-gray-600">Tenders</Link> / {tender.project?.name}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{tender.title}</h1>
          </div>
          <Badge
            label={TENDER_STATUS_LABELS[tender.status as keyof typeof TENDER_STATUS_LABELS]}
            className={TENDER_STATUS_COLOURS[tender.status as keyof typeof TENDER_STATUS_COLOURS]}
          />
        </div>
      </div>

      {/* Unnotified changes banner */}
      {unnotifiedChanges > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{unnotifiedChanges}</strong> change{unnotifiedChanges !== 1 ? 's' : ''} have not been notified to invitees
          </p>
          <button className="text-xs font-medium text-amber-800 hover:text-amber-900 underline">Notify All</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <Link
            key={t.key}
            href={`/tenders/${id}?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Project</p>
              <p className="text-sm font-medium text-gray-900">{tender.project?.name}</p>
              {tender.project?.address && <p className="text-xs text-gray-500">{tender.project.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Issue Date</p>
                <p className="text-sm text-gray-700">{formatDate(tender.issue_date)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Close Date</p>
                <p className="text-sm text-gray-700">{formatDate(tender.close_date)}</p>
              </div>
            </div>
            {tender.description && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{tender.description}</p>
              </div>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Invitees</span>
                <span className="font-medium text-gray-900">{invitees?.length ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Documents</span>
                <span className="font-medium text-gray-900">{tenderDocs?.length ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Changes logged</span>
                <span className="font-medium text-gray-900">{changes?.length ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      {tab === 'documents' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {!tenderDocs?.length ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No documents uploaded yet.</p>
              <p className="text-xs mt-1">Upload tender documents to share with invitees.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Version</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tenderDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{doc.name}</td>
                      <td className="px-4 py-3 text-gray-500">v{doc.version}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(doc.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invitees */}
      {tab === 'invitees' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {!invitees?.length ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No invitees added yet.</p>
              <p className="text-xs mt-1">Add subcontractors to invite them to quote on this tender.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Notified</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Viewed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invitees.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {inv.contact?.company ?? inv.contact?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inv.email}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {inv.notified_at ? formatDate(inv.notified_at) : <span className="text-amber-600 text-xs">Not notified</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {inv.viewed_at ? formatDate(inv.viewed_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Change log */}
      {tab === 'changes' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {!changes?.length ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No changes logged yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {changes.map(change => (
                <div key={change.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-900">{change.change_description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(change.created_at)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${change.notifications_sent ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {change.notifications_sent ? 'Notified' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
