import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { CLAIM_STATUS_COLOURS, CLAIM_STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props { projectId: string }

const DEFAULT_MILESTONES = [
  { name: 'Site Establishment', percentage: 2 },
  { name: 'Demolition / Excavation', percentage: 5 },
  { name: 'Slab Down', percentage: 15 },
  { name: 'Frame Complete', percentage: 20 },
  { name: 'Lock Up', percentage: 20 },
  { name: 'Fixing Stage', percentage: 15 },
  { name: 'Practical Completion', percentage: 18 },
  { name: 'Final', percentage: 5 },
]

export async function ClaimsTab({ projectId }: Props) {
  const supabase = await createClient()

  const { data: milestones } = await supabase
    .from('claim_milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order')

  const { data: claims } = await supabase
    .from('progress_claims')
    .select('*')
    .eq('project_id', projectId)
    .order('claim_number')

  const totalClaimed = claims?.reduce((s, c) => s + (c.amount_claimed ?? 0), 0) ?? 0
  const totalCertified = claims?.reduce((s, c) => s + (c.amount_certified ?? 0), 0) ?? 0
  const totalPaid = claims?.reduce((s, c) => s + (c.amount_paid ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Milestones */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Claim Milestones
          {!milestones?.length && <span className="ml-2 text-xs font-normal text-gray-400">(defaults shown — run schema seed to initialise)</span>}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(milestones?.length ? milestones : DEFAULT_MILESTONES).map((m, i) => (
            <div key={i} className={`p-3 rounded-lg border ${'completed' in m && m.completed ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
              <p className="text-xs font-medium text-gray-700">{m.name}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{m.percentage}%</p>
              {'completed' in m && m.completed && (
                <p className="text-xs text-green-700 mt-0.5">✓ {formatDate((m as { completed_date: string | null }).completed_date)}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      {claims && claims.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Total Claimed</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalClaimed)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Total Certified</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalCertified)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Total Paid</p>
            <p className="text-xl font-bold text-green-700 mt-0.5">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      )}

      {/* Claims list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Progress Claims</p>
        </div>
        {!claims?.length ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No progress claims yet.</p>
            <p className="text-xs mt-1">Claims will appear here once created.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Claim #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Period End</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Claimed</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Certified</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Paid</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map(claim => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{claim.claim_number}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(claim.period_end)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(claim.amount_claimed)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(claim.amount_certified)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(claim.amount_paid)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={CLAIM_STATUS_LABELS[claim.status as keyof typeof CLAIM_STATUS_LABELS]}
                        className={CLAIM_STATUS_COLOURS[claim.status as keyof typeof CLAIM_STATUS_COLOURS]}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(claim.submitted_date)}</td>
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
