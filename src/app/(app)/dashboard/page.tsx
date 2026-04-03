import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { STATUS_COLOURS, STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, TrendingUp, FolderOpen, FileText, Wrench } from 'lucide-react'
import type { Project, User } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:contacts(name, company)')
    .order('created_at', { ascending: false })

  const isOwnerOrOffice = currentUser?.role === 'owner' || currentUser?.role === 'office'

  const activeProjects = projects?.filter(p => p.status === 'active') ?? []
  const tenderProjects = projects?.filter(p => p.status === 'tender') ?? []
  const totalContractValue = activeProjects.reduce((sum, p) => sum + (p.contract_value ?? 0), 0)

  const { data: subcontracts } = isOwnerOrOffice
    ? await supabase.from('subcontracts').select('value').eq('status', 'executed')
    : { data: [] }

  const totalSubcontractValue = subcontracts?.reduce((sum, s) => sum + (s.value ?? 0), 0) ?? 0

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Welcome back, {currentUser?.name?.split(' ')[0]}
          </p>
        </div>
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

      {/* Stats */}
      {isOwnerOrOffice && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Contract Value"
            value={formatCurrency(totalContractValue)}
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            bg="bg-green-50"
          />
          <StatCard
            label="Active Projects"
            value={String(activeProjects.length)}
            icon={<FolderOpen className="w-5 h-5 text-blue-600" />}
            bg="bg-blue-50"
          />
          <StatCard
            label="In Tender"
            value={String(tenderProjects.length)}
            icon={<FileText className="w-5 h-5 text-amber-600" />}
            bg="bg-amber-50"
          />
          <StatCard
            label="Subcontracts Executed"
            value={formatCurrency(totalSubcontractValue)}
            icon={<Wrench className="w-5 h-5 text-purple-600" />}
            bg="bg-purple-50"
          />
        </div>
      )}

      {/* Projects grid */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Projects {projects?.length ? `(${projects.length})` : ''}
        </h2>
        {!projects?.length ? (
          <div className="text-center py-16 text-gray-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project as Project & { client?: { name: string; company: string | null } }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, bg }: { label: string; value: string; icon: React.ReactNode; bg: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function ProjectCard({ project }: { project: Project & { client?: { name: string; company: string | null } | null } }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{project.name}</h3>
          <Badge
            label={STATUS_LABELS[project.status]}
            className={STATUS_COLOURS[project.status]}
          />
        </div>
        <p className="text-xs text-gray-500 mb-3">{project.address}</p>
        {project.client && (
          <p className="text-xs text-gray-600 mb-3">
            Client: {project.client.company ?? project.client.name}
          </p>
        )}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Contract Value</p>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(project.contract_value)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Timeline</p>
            <p className="text-xs text-gray-600">{formatDate(project.start_date)} – {formatDate(project.end_date)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
