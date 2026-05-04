'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Building2, MapPin, Link2, Network, TrendingUp } from 'lucide-react'
import { getStats } from '@/lib/api'
import { useGraphStore } from '@/lib/store'

export default function GraphStats({ className = '' }) {
  const [isLoading, setIsLoading] = useState(true)
  const { stats, setStats } = useGraphStore()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (error) {
      console.error('[v0] Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statItems = [
    {
      label: 'Total Nodes',
      value: stats?.total_nodes || stats?.nodes || 0,
      icon: Network,
      color: 'text-primary',
    },
    {
      label: 'Total Edges',
      value: stats?.total_edges || stats?.edges || 0,
      icon: Link2,
      color: 'text-accent',
    },
    {
      label: 'People',
      value: stats?.entity_counts?.person || stats?.persons || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Organizations',
      value: stats?.entity_counts?.organization || stats?.organizations || 0,
      icon: Building2,
      color: 'text-green-500',
    },
    {
      label: 'Locations',
      value: stats?.entity_counts?.location || stats?.locations || 0,
      icon: MapPin,
      color: 'text-orange-500',
    },
    {
      label: 'Communities',
      value: stats?.communities || 0,
      icon: TrendingUp,
      color: 'text-pink-500',
    },
  ]

  if (isLoading) {
    return (
      <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
        <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Graph Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-3 sm:grid-cols-2 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1 sm:space-y-2">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium">Graph Statistics</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="grid grid-cols-3 sm:grid-cols-2 gap-3 sm:gap-4">
          {statItems.map((item) => (
            <div key={item.label} className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <item.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${item.color}`} />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.label}</span>
              </div>
              <p className="text-lg sm:text-2xl font-semibold tabular-nums">
                {item.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
