'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navigation from '@/components/Navigation'
import QueryPanel from '@/components/QueryPanel'
import AnswerCard from '@/components/AnswerCard'
import EntityPanel from '@/components/EntityPanel'
import GraphStats from '@/components/GraphStats'
import { useGraphStore } from '@/lib/store'
import { getGraph } from '@/lib/api'
import { Loader2 } from 'lucide-react'

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

export default function HomePage() {
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [isLoadingGraph, setIsLoadingGraph] = useState(true)

  const { queryResult, setGraphData, setSelectedNode, clearHighlights } = useGraphStore()

  useEffect(() => {
    loadGraphData()
  }, [])

  const loadGraphData = async () => {
    try {
      const data = await getGraph()
      if (data.nodes && data.relationships) {
        setGraphData(data.nodes, data.relationships)
      } else if (data.nodes && data.links) {
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

  const handleSelectRelated = async (relatedEntity) => {
    if (typeof relatedEntity === 'string') {
      setSelectedEntity({ name: relatedEntity })
    } else {
      setSelectedEntity(relatedEntity)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)]">

          {/* Left Panel */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 sm:gap-6 lg:overflow-auto">

            <div className="bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Knowledge Query</h2>
              <QueryPanel />
            </div>

            <AnswerCard result={queryResult} className="flex-1" />

            <div className="hidden sm:block">
              <GraphStats />
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 xl:col-span-8 relative h-[50vh] sm:h-[60vh] lg:h-auto">
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

          {/* Mobile Stats */}
          <div className="block sm:hidden">
            <GraphStats />
          </div>
        </div>
      </main>
    </div>
  )
}