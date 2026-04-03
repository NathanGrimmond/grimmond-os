import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { STATUS_COLOURS, STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('role').eq('id', authUser.id).single()
  const isOwnerOrOffice = currentUser?.role === 'owner' || currentUser?.role === 'office'

  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:contacts(name, company)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        {isOwnerOrOffice && (
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Project</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Address</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Contract Value</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Start</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects?.map(project => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/projects/${project.id}`} className="font-medium text-gray-900 hover:text-zinc-600">
                      {project.name}
                    </Link>
                    {project.client && (
                      <p className="text-xs text-gray-400 mt-0.5">{project.client.company ?? project.client.name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{project.address}</td>
                  <td className="px-4 py-3">
                    <Badge label={STATUS_LABELS[project.status as keyof typeof STATUS_LABELS]} className={STATUS_COLOURS[project.status as keyof typeof STATUS_COLOURS]} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(project.contract_value)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(project.start_date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(project.end_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
