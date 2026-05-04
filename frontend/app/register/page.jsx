'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()

    const [name, setName] = useState('') 
    const [email, setEmail] = useState('')  
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
          
            await registerUser(email, password)

            router.push('/login')
        } catch (err) {
            setError(err.message || 'Registration failed')
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
                        Join GraphRAG AI 🚀
                    </h1>

                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                        Create your account and explore intelligent knowledge graphs.
                    </p>

                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                        <li>✔ Secure Account</li>
                        <li>✔ Personal Knowledge Graph</li>
                        <li>✔ AI-powered Insights</li>
                        <li>✔ Fast Semantic Search</li>
                    </ul>
                </div>

                {/* RIGHT */}
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6 lg:p-8 w-full max-w-md mx-auto">

                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                        Register
                    </h2>

                    {error && (
                        <div className="mb-4 text-sm text-red-500 break-words">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">

                        {/*  NAME */}
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2.5 sm:p-3 rounded-lg bg-background border border-border text-sm sm:text-base"
                            required
                        />

                        {/*  EMAIL */}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2.5 sm:p-3 rounded-lg bg-background border border-border text-sm sm:text-base"
                            required
                        />

                        {/* PASSWORD */}
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
                                'Register'
                            )}
                        </button>
                    </form>

                    <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <span
                            onClick={() => router.push('/login')}
                            className="text-primary cursor-pointer"
                        >
                            Login
                        </span>
                    </p>
                </div>

            </div>
        </div>
    )
}