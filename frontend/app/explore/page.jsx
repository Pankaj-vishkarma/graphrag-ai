'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navigation from '@/components/Navigation'
import EntityPanel from '@/components/EntityPanel'
import GraphStats from '@/components/GraphStats'
import PathView from '@/components/PathView'
import CypherEditor from '@/components/CypherEditor'
import { useGraphStore } from '@/lib/store'
import { getGraph } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Loader2, 
  Users, 
  Building2, 
  MapPin, 
  X,
  Filter
} from 'lucide-react'

const GraphVisualization = dynamic(
  () => import('@/components/GraphVisualization'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
)

const ENTITY_TYPES = [
  { value: 'person', label: 'Person', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
  { value: 'organization', label: 'Organization', icon: Building2, color: 'bg-green-500/10 text-green-500' },
  { value: 'location', label: 'Location', icon: MapPin, color: 'bg-orange-500/10 text-orange-500' },
]

export default function ExplorePage() {
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [isLoadingGraph, setIsLoadingGraph] = useState(true)
  const [showFilters, setShowFilters] = useState(true)
  
  const { 
    setGraphData, 
    setSelectedNode, 
    clearHighlights,
    searchQuery,
    setSearchQuery,
    entityTypeFilter,
    setEntityTypeFilter,
    nodes,
    links,
  } = useGraphStore()

  useEffect(() => {
    loadGraphData()
  }, [])

  const loadGraphData = async () => {
    try {
      const data = await getGraph()
      if (data.nodes && data.links) {
        setGraphData(data.nodes, data.links)
      } else if (data.nodes && data.edges) {
        setGraphData(data.nodes, data.edges)
      }
    } catch (error) {
      console.error('[v0] Failed to load graph data:', error)
    } finally {
      setIsLoadingGraph(false)
    }
  }

  const handleNodeClick = (node) => {
    setSelectedNode(node)
    setSelectedEntity(node)
  }

  const handleCloseEntityPanel = () => {
    setSelectedEntity(null)
    setSelectedNode(null)
    clearHighlights()
  }

  const handleSelectRelated = (relatedEntity) => {
    if (typeof relatedEntity === 'string') {
      setSelectedEntity({ name: relatedEntity })
    } else {
      setSelectedEntity(relatedEntity)
    }
  }

  const toggleEntityType = (type) => {
    if (entityTypeFilter.includes(type)) {
      setEntityTypeFilter(entityTypeFilter.filter(t => t !== type))
    } else {
      setEntityTypeFilter([...entityTypeFilter, type])
    }
  }

  const clearFilters = () => {
    setEntityTypeFilter([])
    setSearchQuery('')
    clearHighlights()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)]">
          {/* Sidebar */}
          {showFilters && (
            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-3 sm:gap-4 lg:overflow-auto order-2 lg:order-1">
              {/* Search */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Search Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name..."
                      className="pl-9 bg-background/50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Entity Type Filters */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
                    {entityTypeFilter.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={clearFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ENTITY_TYPES.map(({ value, label, icon: Icon, color }) => {
                      const isActive = entityTypeFilter.includes(value)
                      return (
                        <Button
                          key={value}
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          className={`gap-2 ${!isActive ? color : ''}`}
                          onClick={() => toggleEntityType(value)}
                        >
                          <Icon className="h-3 w-3" />
                          {label}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <GraphStats />

              {/* Path Finder */}
              <PathView />

              {/* Cypher Editor */}
              <CypherEditor />
            </div>
          )}

          {/* Main Graph Area */}
          <div className="flex-1 relative h-[50vh] sm:h-[60vh] lg:h-auto order-1 lg:order-2">
            {/* Toggle Sidebar Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
            </Button>

            {/* Active Filters */}
            {(entityTypeFilter.length > 0 || searchQuery) && (
              <div className="absolute top-2 left-12 sm:top-4 sm:left-36 z-10 flex items-center gap-1 sm:gap-2 flex-wrap max-w-[60%] sm:max-w-none">
                {entityTypeFilter.map(type => (
                  <Badge 
                    key={type} 
                    variant="secondary"
                    className="gap-1 pr-1 capitalize text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">{type}</span>
                    <span className="sm:hidden">{type.slice(0, 3)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => toggleEntityType(type)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 pr-1 text-xs sm:text-sm">
                    <span className="max-w-16 sm:max-w-none truncate">{`"${searchQuery}"`}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}

            {/* Graph Info */}
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-10">
              <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm text-xs sm:text-sm">
                {nodes.length} nodes · {links.length} edges
              </Badge>
            </div>

            <div className="absolute inset-0 bg-card/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 overflow-hidden">
              {isLoadingGraph ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
                    <p className="text-xs sm:text-sm text-muted-foreground">Loading knowledge graph...</p>
                  </div>
                </div>
              ) : (
                <GraphVisualization onNodeClick={handleNodeClick} />
              )}
            </div>

            {/* Entity Panel Overlay */}
            {selectedEntity && (
              <div className="absolute inset-x-2 bottom-2 sm:inset-auto sm:top-4 sm:right-4 sm:w-80 z-10">
                <EntityPanel
                  entity={selectedEntity}
                  onClose={handleCloseEntityPanel}
                  onSelectRelated={handleSelectRelated}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
