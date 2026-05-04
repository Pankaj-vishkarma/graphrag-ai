'use client'

import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Database, Layers, Clock, Trophy, CheckCircle2 } from 'lucide-react'

function ResultColumn({ result, type, isBest = false }) {
  const getIcon = () => {
    switch (type) {
      case 'graph':
        return <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'vector':
        return <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'hybrid':
        return <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      default:
        return null
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'graph':
        return 'Graph RAG'
      case 'vector':
        return 'Vector Search'
      case 'hybrid':
        return 'Hybrid'
      default:
        return type
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case 'graph':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'vector':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'hybrid':
        return 'bg-primary/10 text-primary border-primary/20'
      default:
        return ''
    }
  }

  if (!result) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/30 h-full">
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-xs sm:text-sm font-medium">{getTitle()}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8 sm:py-12 p-3 sm:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">No result</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`h-full ${isBest ? 'ring-2 ring-primary/50 bg-card/60' : 'bg-card/30'} backdrop-blur-sm border-border/30`}>
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-xs sm:text-sm font-medium">{getTitle()}</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isBest && (
              <Badge className="gap-1 bg-primary text-primary-foreground text-[10px] sm:text-xs">
                <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Best
              </Badge>
            )}
            {result.response_time && (
              <Badge variant="outline" className={`gap-1 text-[10px] sm:text-xs ${getTypeColor()}`}>
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {result.response_time}ms
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <ScrollArea className="h-[200px] sm:h-[300px] pr-2 sm:pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
            <ReactMarkdown>
              {result.answer || result.response || 'No answer available'}
            </ReactMarkdown>
          </div>

          {result.context && result.context.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/30">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">
                Context ({result.context.length} chunks)
              </p>
              <div className="space-y-1.5 sm:space-y-2">
                {result.context.slice(0, 2).map((ctx, i) => (
                  <div key={i} className="text-[10px] sm:text-xs text-muted-foreground p-1.5 sm:p-2 rounded bg-muted/20 line-clamp-2">
                    {ctx.text || ctx.content || ctx}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.entities && result.entities.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/30">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">
                Entities Found
              </p>
              <div className="flex flex-wrap gap-1">
                {result.entities.slice(0, 5).map((entity, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs">
                    {entity.name || entity}
                  </Badge>
                ))}
                {result.entities.length > 5 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    +{result.entities.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {result.score !== undefined && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Relevance Score</span>
                <span className="text-xs sm:text-sm font-medium">{(result.score * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default function ComparisonView({ graphResult, vectorResult, hybridResult, className = '' }) {
  const getBestMethod = () => {
    const results = [
      { type: 'graph', result: graphResult },
      { type: 'vector', result: vectorResult },
      { type: 'hybrid', result: hybridResult },
    ].filter(r => r.result)

    if (results.length === 0) return null

    // Determine best by score or response time
    let best = results[0]
    for (const r of results) {
      if (r.result.score > (best.result.score || 0)) {
        best = r
      } else if (r.result.response_time && best.result.response_time) {
        if (r.result.response_time < best.result.response_time && !r.result.score) {
          best = r
        }
      }
    }
    
    return best.type
  }

  const bestMethod = getBestMethod()

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${className}`}>
      <ResultColumn 
        result={graphResult} 
        type="graph" 
        isBest={bestMethod === 'graph'}
      />
      <ResultColumn 
        result={vectorResult} 
        type="vector" 
        isBest={bestMethod === 'vector'}
      />
      <ResultColumn 
        result={hybridResult} 
        type="hybrid" 
        isBest={bestMethod === 'hybrid'}
      />
    </div>
  )
}
