import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  projectId: string
}

export async function CostingTab({ projectId }: Props) {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('cost_categories')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order')

  const { data: items } = await supabase
    .from('cost_items')
    .select('*, category:cost_categories(id, name)')
    .eq('project_id', projectId)

  const uncategorised = items?.filter(i => !i.category_id) ?? []
  const categoryGroups = categories?.map(cat => ({
    category: cat,
    items: items?.filter(i => i.category_id === cat.id) ?? [],
  })) ?? []

  if (categoryGroups.length === 0 && uncategorised.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No cost items yet. Add categories and line items to get started.</p>
      </div>
    )
  }

  const allItems = items ?? []
  const grandBudget = allItems.reduce((s, i) => s + (i.budgeted ?? 0), 0)
  const grandCommitted = allItems.reduce((s, i) => s + (i.committed ?? 0), 0)
  const grandActual = allItems.reduce((s, i) => s + (i.actual ?? 0), 0)
  const grandVariance = grandBudget - grandActual

  const groups = [
    ...categoryGroups,
    ...(uncategorised.length > 0 ? [{ category: { id: null, name: 'Uncategorised' }, items: uncategorised }] : []),
  ]

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Budgeted</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Committed</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Actual</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Variance</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">% Used</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(({ category, items: groupItems }) => {
                const subBudget = groupItems.reduce((s, i) => s + (i.budgeted ?? 0), 0)
                const subCommitted = groupItems.reduce((s, i) => s + (i.committed ?? 0), 0)
                const subActual = groupItems.reduce((s, i) => s + (i.actual ?? 0), 0)
                const subVariance = subBudget - subActual

                return (
                  <>
                    {/* Category header */}
                    <tr key={`cat-${category.id}`} className="bg-gray-50 border-y border-gray-100">
                      <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {category.name}
                      </td>
                    </tr>
                    {/* Items */}
                    {groupItems.map(item => {
                      const pct = item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 0
                      const variance = item.budgeted - item.actual
                      return (
                        <tr key={item.id} className={cn(
                          'border-b border-gray-50 hover:bg-gray-50 transition-colors',
                        )}>
                          <td className="px-4 py-2.5 text-gray-700 pl-8">{item.description}</td>
                          <td className="px-4 py-2.5 text-right text-gray-700">{formatCurrency(item.budgeted)}</td>
                          <td className="px-4 py-2.5 text-right text-gray-600">{formatCurrency(item.committed)}</td>
                          <td className="px-4 py-2.5 text-right text-gray-700">{formatCurrency(item.actual)}</td>
                          <td className={cn('px-4 py-2.5 text-right font-medium', variance >= 0 ? 'text-green-700' : 'text-red-700')}>
                            {variance >= 0 ? '' : '-'}{formatCurrency(Math.abs(variance))}
                          </td>
                          <td className={cn('px-4 py-2.5 text-right text-xs font-medium',
                            pct > 100 ? 'text-red-700' : pct > 90 ? 'text-amber-700' : 'text-green-700'
                          )}>
                            {pct.toFixed(0)}%
                          </td>
                        </tr>
                      )
                    })}
                    {/* Subtotal */}
                    <tr key={`sub-${category.id}`} className="border-b border-gray-200 bg-gray-50/50">
                      <td className="px-4 py-2 pl-8 text-xs font-semibold text-gray-500">Subtotal</td>
                      <td className="px-4 py-2 text-right text-xs font-semibold text-gray-700">{formatCurrency(subBudget)}</td>
                      <td className="px-4 py-2 text-right text-xs font-semibold text-gray-600">{formatCurrency(subCommitted)}</td>
                      <td className="px-4 py-2 text-right text-xs font-semibold text-gray-700">{formatCurrency(subActual)}</td>
                      <td className={cn('px-4 py-2 text-right text-xs font-semibold', subVariance >= 0 ? 'text-green-700' : 'text-red-700')}>
                        {subVariance >= 0 ? '' : '-'}{formatCurrency(Math.abs(subVariance))}
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-gray-400">
                        {subBudget > 0 ? ((subActual / subBudget) * 100).toFixed(0) + '%' : '—'}
                      </td>
                    </tr>
                  </>
                )
              })}

              {/* Grand total */}
              <tr className="bg-zinc-900 text-white">
                <td className="px-4 py-3 font-bold text-sm">Total</td>
                <td className="px-4 py-3 text-right font-bold text-sm">{formatCurrency(grandBudget)}</td>
                <td className="px-4 py-3 text-right font-semibold text-sm text-zinc-300">{formatCurrency(grandCommitted)}</td>
                <td className="px-4 py-3 text-right font-bold text-sm">{formatCurrency(grandActual)}</td>
                <td className={cn('px-4 py-3 text-right font-bold text-sm', grandVariance >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {grandVariance >= 0 ? '' : '-'}{formatCurrency(Math.abs(grandVariance))}
                </td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">
                  {grandBudget > 0 ? ((grandActual / grandBudget) * 100).toFixed(0) + '%' : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
