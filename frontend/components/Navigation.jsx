'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  Network,
  Compass,
  GitCompare,
  Users2,
  FileText,
  Sun,
  Moon,
  Sparkles,
  LogOut
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Query', icon: Sparkles },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/communities', label: 'Communities', icon: Users2 },
  { href: '/documents', label: 'Documents', icon: FileText },
]



export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [token, setToken] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
  }, [])

  // HIDE NAVBAR ON AUTH PAGES
  const publicRoutes = ['/login', '/register']
  if (publicRoutes.includes(pathname)) return null

  if (!mounted) return null   // 👈 IMPORTANT FIX

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">

          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <Network className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-base sm:text-lg hidden sm:inline">
                GraphRAG
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-2 transition-colors',
                        isActive && 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">

            {/* THEME TOGGLE */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
            >
              <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* 🔥 LOGOUT BUTTON (ONLY IF LOGGED IN) */}
            {token && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* MOBILE NAV */}
        <nav className="flex md:hidden items-center gap-1 pb-2 sm:pb-3 overflow-x-auto scrollbar-hide -mx-3 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-1.5 sm:gap-2 flex-shrink-0 text-xs sm:text-sm h-8 px-2.5 sm:px-3',
                    isActive && 'bg-secondary text-secondary-foreground'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:inline">
                    {item.label}
                  </span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}