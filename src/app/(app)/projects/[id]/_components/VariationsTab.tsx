import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import {
  VARIATION_STATUS_COLOURS, VARIATION_STATUS_LABELS,
  VARIATION_TYPE_COLOURS, VARIATION_TYPE_LABELS
} from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props { projectId: string }

export async function VariationsTab({ projectId }: Props) {
  const supabase = await createClient()

  const { data: variations } = await supabase
    .from('variations')
    .select('*')
    .eq('project_id', projectId)
    .order('variation_number')

  const approvedTotal = variations?.filter(v => v.status === 'approved').reduce((s, v) => s + (v.amount ?? 0), 0) ?? 0
  const pendingTotal = variations?.filter(v => v.status === 'pending').reduce((s, v) => s + (v.amount ?? 0), 0) ?? 0

  return (
    <div className="space-y-4">
      {variations && variations.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Approved Variations</p>
            <p className={`text-xl font-bold mt-0.5 ${approvedTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(approvedTotal)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Pending Variations</p>
            <p className="text-xl font-bold text-amber-700 mt-0.5">{formatCurrency(pendingTotal)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Net Contract Adjustment</p>
            <p className={`text-xl font-bold mt-0.5 ${approvedTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(approvedTotal)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {!variations?.length ? (
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
                    <td className="px-4 py-3">
                      <Badge
                        label={VARIATION_TYPE_LABELS[v.type as keyof typeof VARIATION_TYPE_LABELS]}
                        className={VARIATION_TYPE_COLOURS[v.type as keyof typeof VARIATION_TYPE_COLOURS]}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{v.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${v.amount >= 0 ? 'text-gray-900' : 'text-red-700'}`}>
                      {formatCurrency(v.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={VARIATION_STATUS_LABELS[v.status as keyof typeof VARIATION_STATUS_LABELS]}
                        className={VARIATION_STATUS_COLOURS[v.status as keyof typeof VARIATION_STATUS_COLOURS]}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(v.approved_date)}</td>
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
