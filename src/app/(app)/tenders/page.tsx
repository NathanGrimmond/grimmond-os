import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { TENDER_STATUS_COLOURS, TENDER_STATUS_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default async function TendersPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('role').eq('id', authUser.id).single()
  const isOwnerOrOffice = currentUser?.role === 'owner' || currentUser?.role === 'office'

  const { data: tenders } = await supabase
    .from('tenders')
    .select('*, project:projects(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenders</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage tender packages across all projects</p>
        </div>
        {isOwnerOrOffice && (
          <Link
            href="/tenders/new"
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Tender
          </Link>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {!tenders?.length ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm font-medium">No tenders yet</p>
            <p className="text-xs mt-1">Create a tender package to invite subcontractors to quote</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Project</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Issue Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Close Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenders.map(tender => (
                  <tr key={tender.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/tenders/${tender.id}`} className="font-medium text-gray-900 hover:text-zinc-600">
                        {tender.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tender.project?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={TENDER_STATUS_LABELS[tender.status as keyof typeof TENDER_STATUS_LABELS]}
                        className={TENDER_STATUS_COLOURS[tender.status as keyof typeof TENDER_STATUS_COLOURS]}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(tender.issue_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(tender.close_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
