'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await loginUser(email, password)

      localStorage.setItem('token', data.access)
      router.push('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-4 sm:gap-6">

        {/* LEFT */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6 lg:p-8 flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
            Welcome to GraphRAG AI 🚀
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            Explore knowledge like never before using Graph + AI powered search.
          </p>

          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>✔ Hybrid Search (Graph + Vector)</li>
            <li>✔ Knowledge Graph Visualization</li>
            <li>✔ Smart Query Answering</li>
            <li>✔ Personalized Data per User</li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6 lg:p-8 w-full max-w-md mx-auto">

          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
            Login
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-500 break-words">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">

            {/* 🔥 EMAIL INPUT */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-lg bg-background border border-border text-sm sm:text-base"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-lg bg-background border border-border text-sm sm:text-base"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full p-2.5 sm:p-3 rounded-lg bg-primary text-white flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
            Don’t have an account?{' '}
            <span
              onClick={() => router.push('/register')}
              className="text-primary cursor-pointer"
            >
              Register
            </span>
          </p>
        </div>

      </div>
    </div>
  )
}