'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HardHat } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <HardHat className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Grimmond OS</p>
            <p className="text-zinc-500 text-xs">Team Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-6">Access your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                placeholder="you@grimmondconstruction.com.au"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Grimmond Construction &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
