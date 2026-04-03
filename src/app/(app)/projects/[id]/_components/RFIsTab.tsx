import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { RFI_PRIORITY_COLOURS, RFI_PRIORITY_LABELS, RFI_STATUS_COLOURS, RFI_STATUS_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface Props { projectId: string }

export async function RFIsTab({ projectId }: Props) {
  const supabase = await createClient()

  const { data: rfis } = await supabase
    .from('rfis')
    .select('*')
    .eq('project_id', projectId)
    .order('rfi_number')

  const open = rfis?.filter(r => r.status === 'open').length ?? 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">{rfis?.length ?? 0} RFI{rfis?.length !== 1 ? 's' : ''}</p>
        {open > 0 && <p className="text-xs font-medium text-amber-700">{open} open</p>}
      </div>
      {!rfis?.length ? (
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
                  <td className="px-4 py-3">
                    <Badge
                      label={RFI_PRIORITY_LABELS[rfi.priority as keyof typeof RFI_PRIORITY_LABELS]}
                      className={RFI_PRIORITY_COLOURS[rfi.priority as keyof typeof RFI_PRIORITY_COLOURS]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={RFI_STATUS_LABELS[rfi.status as keyof typeof RFI_STATUS_LABELS]}
                      className={RFI_STATUS_COLOURS[rfi.status as keyof typeof RFI_STATUS_COLOURS]}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(rfi.due_date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(rfi.answered_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
