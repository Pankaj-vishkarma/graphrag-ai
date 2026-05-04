'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthProvider({ children }) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const token = localStorage.getItem('token')

        const publicRoutes = ['/login', '/register']

        // ❌ Not logged in → redirect to login
        if (!token && !publicRoutes.includes(pathname)) {
            router.push('/login')
        }

        // ❌ Already logged in → block login/register
        if (token && publicRoutes.includes(pathname)) {
            router.push('/')
        }

    }, [pathname, router])

    return children
}