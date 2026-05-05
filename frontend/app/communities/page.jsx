'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navigation from '@/components/Navigation'
import CommunityView from '@/components/CommunityView'
import { getCommunities, getGraph } from '@/lib/api'
import { useGraphStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users2, Loader2, Network, ArrowLeft } from 'lucide-react'

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

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [isLoadingGraph, setIsLoadingGraph] = useState(false)

  const {
    setGraphData,
    setHighlightedNodes,
    clearHighlights,
    nodes,
    links
  } = useGraphStore()

  console.log("GRAPH NODES:", nodes)
  console.log("GRAPH LINKS:", links)

  useEffect(() => {
    loadCommunities()
    loadFullGraph()
  }, [])

  const loadCommunities = async () => {
    try {
      const data = await getCommunities()
      setCommunities(Array.isArray(data) ? data : data.communities || [])
    } catch (error) {
      console.error('[v0] Failed to load communities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFullGraph = async () => {
    try {
      const data = await getGraph()

      console.log("GRAPH API RESPONSE:", data)

      if (data && data.nodes) {
        setGraphData(data.nodes, data.links || data.edges || [])
      }

    } catch (error) {
      console.error('[v0] Failed to load graph:', error)
    }
  }

  const handleExpandCommunity = (community) => {
    setSelectedCommunity(community)
    setIsLoadingGraph(true)

    if (!nodes || nodes.length === 0) {
      console.log("Graph not loaded yet")
      return
    }

    const matchedNodeIds = nodes
      .filter(node => community.entities.includes(node.name))
      .map(node => node.id)

    setHighlightedNodes(new Set(matchedNodeIds))

    setTimeout(() => setIsLoadingGraph(false), 500)
  }

  const handleBackToList = () => {
    setSelectedCommunity(null)
    clearHighlights()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Communities</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Explore detected communities in your knowledge graph
              </p>
            </div>
          </div>
        </div>

        {selectedCommunity ? (
          /* Community Graph View */
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Button
                variant="ghost"
                className="gap-2 w-fit"
                onClick={handleBackToList}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm sm:text-base">Back to Communities</span>
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {selectedCommunity.entities?.length || 0} entities
                </Badge>
              </div>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Network className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      {selectedCommunity.label || selectedCommunity.name || `Community ${selectedCommunity.id}`}
                    </CardTitle>
                    {selectedCommunity.summary && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {selectedCommunity.summary}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="h-[50vh] sm:h-[60vh] lg:h-[calc(100vh-20rem)] bg-card/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 overflow-hidden">
              {isLoadingGraph ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                </div>
              ) : (
                nodes.length > 0 ? (
                  <GraphVisualization nodes={nodes} links={links} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No graph data available</p>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          /* Communities List */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : communities.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Users2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Communities Found</h2>
                <p className="text-muted-foreground max-w-md">
                  Upload documents to build your knowledge graph and discover communities.
                </p>
              </div>
            ) : (
              communities.map((community, index) => (
                <CommunityView
                  key={community.id || index}
                  community={community}
                  onExpand={handleExpandCommunity}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
