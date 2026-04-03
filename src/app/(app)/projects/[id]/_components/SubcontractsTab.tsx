import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { SUBCONTRACT_STATUS_COLOURS, SUBCONTRACT_STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  projectId: string
}

export async function SubcontractsTab({ projectId }: Props) {
  const supabase = await createClient()

  const { data: subcontracts } = await supabase
    .from('subcontracts')
    .select('*, contact:contacts(name, company)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  const totalValue = subcontracts?.reduce((s, sc) => s + (sc.value ?? 0), 0) ?? 0

  if (!subcontracts?.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No subcontracts yet for this project.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{subcontracts.length} subcontract{subcontracts.length !== 1 ? 's' : ''}</p>
          <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(totalValue)}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Trade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Company</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Value</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Executed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subcontracts.map(sc => (
                <tr key={sc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{sc.trade}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {sc.contact
                      ? (sc.contact.company ?? sc.contact.name)
                      : <span className="text-gray-400 italic">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(sc.value)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      label={SUBCONTRACT_STATUS_LABELS[sc.status as keyof typeof SUBCONTRACT_STATUS_LABELS]}
                      className={SUBCONTRACT_STATUS_COLOURS[sc.status as keyof typeof SUBCONTRACT_STATUS_COLOURS]}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(sc.executed_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
