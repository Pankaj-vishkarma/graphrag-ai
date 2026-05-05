'use client'

import { useState } from 'react'
import { ArrowRight, Search, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPath } from '@/lib/api'
import { useGraphStore } from '@/lib/store'
import { toast } from 'sonner'

export default function PathView({ className = '' }) {
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const [path, setPath] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { setHighlightedNodes, setHighlightedLinks } = useGraphStore()

  const handleFindPath = async () => {
    if (!source.trim() || !target.trim()) {
      toast.error('Please enter both source and target entities')
      return
    }

    setIsLoading(true)
    try {
      const result = await getPath(source, target)
      setPath(result)
      
      if (result.nodes) {
        setHighlightedNodes(result.nodes.map(n => n.id || n.name))
      }
      
      if (result.edges || result.links) {
        const edges = result.edges || result.links
        setHighlightedLinks(edges.map(e => `${e.source}-${e.target}`))
      }
      
      toast.success('Path found!')
    } catch (error) {
      console.error('[v0] Path finding error:', error)
      toast.error(error.message || 'No path found between entities')
      setPath(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Find Path</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source entity..."
            className="flex-1 bg-background/50"
          />
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target entity..."
            className="flex-1 bg-background/50"
          />
        </div>
        
        <Button 
          onClick={handleFindPath} 
          disabled={isLoading || !source.trim() || !target.trim()}
          className="w-full gap-2"
          variant="secondary"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Find Path
        </Button>

        {path && path.nodes && path.nodes.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3">
              Path length: {path.nodes.length} nodes
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {path.nodes.map((node, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {node.name || node.label || node}
                  </Badge>
                  {index < path.nodes.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            
            {path.relationships && path.relationships.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground">Relationships:</p>
                {path.relationships.map((rel, index) => (
                  <p key={index} className="text-xs">
                    <span className="text-muted-foreground">{rel.source}</span>
                    {' → '}
                    <span className="text-primary">{rel.type}</span>
                    {' → '}
                    <span className="text-muted-foreground">{rel.target}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
