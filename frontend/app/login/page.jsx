'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Brain, Network, Zap, Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [activeCard, setActiveCard] = useState(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    const errors = []

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push("Enter a valid email")
    }

    if (!password || password.length < 6) {
      errors.push("Password must be at least 6 characters")
    }

    if (errors.length > 0) {
      setError(errors.join(" • "))
      return false
    }

    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const data = await loginUser(email, password)
      localStorage.setItem('token', data.access)
      router.push('/')
    } catch (err) {
      setError(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-white dark:bg-black">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-black dark:text-white">
            GraphRAG AI Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Query knowledge graphs, explore relationships, and unlock multi-hop intelligence.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4 backdrop-blur">
            {error}
          </div>
        )}

        {/* LOGIN BAR */}
        <form
          onSubmit={handleLogin}
          className="
          flex flex-col sm:flex-row 
          items-stretch sm:items-center 
          gap-3 
          bg-white/70 dark:bg-white/5
          border border-gray-200 dark:border-white/10 
          rounded-2xl p-3 backdrop-blur mb-10
        "
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
  flex-1 px-4 py-3 text-sm
  bg-white dark:bg-transparent
  text-black dark:text-white
  placeholder:text-gray-400
  outline-none

  border border-gray-300 dark:border-white/10
  rounded-xl

  hover:border-purple-400/60
  dark:hover:border-purple-400/40

  focus:ring-2 focus:ring-purple-500/40
  focus:border-purple-500

  transition-all duration-200
"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
  flex-1 px-4 py-3 text-sm
  bg-white dark:bg-transparent
  text-black dark:text-white
  placeholder:text-gray-400
  outline-none

  border border-gray-300 dark:border-white/10
  rounded-xl

  hover:border-purple-400/60
  dark:hover:border-purple-400/40

  focus:ring-2 focus:ring-purple-500/40
  focus:border-purple-500

  transition-all duration-200
"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="
            w-full sm:w-auto
            px-6 py-3 rounded-xl 
            bg-gradient-to-r from-purple-500 to-blue-500 
            text-white text-sm font-medium
            flex items-center justify-center
            shadow-md hover:shadow-lg
            hover:opacity-90 active:scale-95
            transition-all
          "
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
          </button>
        </form>

        {/* FEATURE SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {[
            {
              title: 'Hybrid Search',
              desc: 'Combines graph traversal with vector similarity.',
              extra: 'Structured + semantic retrieval for best results.',
              icon: Brain,
            },
            {
              title: 'Graph Visualization',
              desc: 'Explore relationships in interactive graph view.',
              extra: 'Understand connections visually.',
              icon: Network,
            },
            {
              title: 'Multi-hop Reasoning',
              desc: 'Answer complex queries across nodes.',
              extra: 'Traverse multiple relationships intelligently.',
              icon: Zap,
            },
            {
              title: 'User Data Isolation',
              desc: 'Secure and personalized knowledge graphs.',
              extra: 'Private graph per user.',
              icon: Shield,
            },
          ].map((item, i) => {
            const Icon = item.icon

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                transition={{ delay: i * 0.1 }}
                className="
                group relative p-6 rounded-2xl 
                bg-white dark:bg-white/5
                border border-gray-200 dark:border-white/10 
                shadow-sm hover:shadow-md
                backdrop-blur 
                overflow-hidden cursor-pointer
                transition-all duration-300
                hover:border-purple-400/40
              "
              >

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.15),transparent_40%)]" />

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%]" />

                <div className="relative z-10">

                  <div className="mb-3 w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 group-hover:bg-purple-500/20 transition">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>

                  <h3 className="text-base font-semibold mb-2 text-black dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.desc}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.extra}
                  </p>
                </div>

              </motion.div>
            )
          })}

        </div>

        {/* REGISTER */}
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
          Don’t have an account?{' '}
          <span
            onClick={() => router.push('/register')}
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

      </motion.div>
    </div>
  )
}