'use client'

import { useState } from 'react'
import { Search, Loader2, Sparkles, Database, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGraphStore } from '@/lib/store'
import { queryHybrid, queryGraph, queryVector, getDocuments } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function QueryPanel({ onQueryResult }) {
  const [query, setQuery] = useState('')
  const { queryMethod, setQueryMethod, isQuerying, setIsQuerying, setQueryResult, setHighlightedNodes } = useGraphStore()

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!query.trim() || isQuerying) return

    // STEP 1: DOCUMENT CHECK
    try {
      const res = await getDocuments()

      if (!res.documents || res.documents.length === 0) {
        toast.error('Please upload documents first')
        router.push('/documents')
        return
      }
    } catch (err) {
      console.error('[v0] Document check error:', err)
      toast.error('Failed to verify documents')
      return
    }

    // STEP 2: ORIGINAL FLOW
    setIsQuerying(true)

    try {
      let result

      switch (queryMethod) {
        case 'graph':
          result = await queryGraph(query)
          break
        case 'vector':
          result = await queryVector(query)
          break
        case 'hybrid':
        default:
          result = await queryHybrid(query)
          break
      }

      setQueryResult(result)

      if (result.entities && Array.isArray(result.entities)) {
        setHighlightedNodes(result.entities.map(e => e.id || e.name))
      }

      if (onQueryResult) {
        onQueryResult(result)
      }

      toast.success('Query completed successfully')
    } catch (error) {
      console.error('[v0] Query error:', error)
      toast.error(error.message || 'Failed to execute query')
    } finally {
      setIsQuerying(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={queryMethod} onValueChange={setQueryMethod} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="hybrid" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Hybrid</span>
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Graph</span>
          </TabsTrigger>
          <TabsTrigger value="vector" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Vector</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your knowledge graph..."
          className="min-h-[100px] resize-none bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary"
          disabled={isQuerying}
        />

        <Button
          type="submit"
          disabled={!query.trim() || isQuerying}
          className="w-full gap-2"
        >
          {isQuerying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search Knowledge Graph
            </>
          )}
        </Button>
      </form>

      <div className="text-xs text-muted-foreground">
        {queryMethod === 'hybrid' && 'Combines graph traversal with vector similarity for comprehensive results'}
        {queryMethod === 'graph' && 'Uses graph relationships and multi-hop reasoning'}
        {queryMethod === 'vector' && 'Uses semantic similarity search on document embeddings'}
      </div>
    </div>
  )
}