import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { PO_STATUS_COLOURS, PO_STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props { projectId: string }

export async function PurchaseOrdersTab({ projectId }: Props) {
  const supabase = await createClient()

  const { data: pos } = await supabase
    .from('purchase_orders')
    .select('*, subcontract:subcontracts(trade, contact:contacts(name, company))')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  const total = pos?.reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0

  if (!pos?.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No purchase orders yet for this project.</p>
        <p className="text-xs mt-1">Purchase orders will appear here once created.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{pos.length} purchase order{pos.length !== 1 ? 's' : ''}</p>
          <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</p>
        </div>
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
                    {po.subcontract
                      ? `${po.subcontract.trade}${po.subcontract.contact ? ` — ${po.subcontract.contact.company ?? po.subcontract.contact.name}` : ''}`
                      : <span className="text-gray-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(po.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      label={PO_STATUS_LABELS[po.status as keyof typeof PO_STATUS_LABELS]}
                      className={PO_STATUS_COLOURS[po.status as keyof typeof PO_STATUS_COLOURS]}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(po.issued_date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(po.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
