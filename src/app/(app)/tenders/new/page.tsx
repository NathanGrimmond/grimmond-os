import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewTenderForm } from './_components/NewTenderForm'

export default async function NewTenderPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('role').eq('id', authUser.id).single()
  if (!currentUser || !['owner', 'office'].includes(currentUser.role)) redirect('/tenders')

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .in('status', ['tender', 'active'])
    .order('name')

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-1"><a href="/tenders" className="hover:text-gray-600">Tenders</a> / New</p>
        <h1 className="text-2xl font-bold text-gray-900">New Tender</h1>
      </div>
      <NewTenderForm projects={projects ?? []} />
    </div>
  )
}
