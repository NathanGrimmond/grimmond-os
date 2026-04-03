import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import type { User } from '@/types/database'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user as User} />
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  )
}
