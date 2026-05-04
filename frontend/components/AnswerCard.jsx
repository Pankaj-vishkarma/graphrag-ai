'use client'

import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Database, Layers, Clock, FileText } from 'lucide-react'

export default function AnswerCard({ result, className = '' }) {
  if (!result) {
    return (
      <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center p-4 sm:p-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ask a question to explore your knowledge graph
          </p>
        </CardContent>
      </Card>
    )
  }

  const getMethodIcon = () => {
    switch (result.method) {
      case 'graph':
        return <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'vector':
        return <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'hybrid':
      default:
        return <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    }
  }

  const getMethodLabel = () => {
    switch (result.method) {
      case 'graph':
        return 'Graph RAG'
      case 'vector':
        return 'Vector Search'
      case 'hybrid':
      default:
        return 'Hybrid'
    }
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-medium">Answer</CardTitle>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {result.response_time && (
              <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {result.response_time}ms
              </Badge>
            )}
            <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 text-[10px] sm:text-xs">
              {getMethodIcon()}
              <span className="hidden xs:inline">{getMethodLabel()}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <ScrollArea className="max-h-[250px] sm:max-h-[400px] pr-2 sm:pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
            <ReactMarkdown>
              {result.hybrid_answer || result.answer || result.response || 'No answer available'}
            </ReactMarkdown>
          </div>

          {result.context && result.context.length > 0 && (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/50">
              <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                Context Used
              </h4>
              <div className="space-y-1.5 sm:space-y-2">
                {result.context.slice(0, 3).map((ctx, index) => (
                  <div
                    key={index}
                    className="text-[10px] sm:text-xs text-muted-foreground p-1.5 sm:p-2 rounded-lg bg-muted/30 line-clamp-2"
                  >
                    {ctx.text || ctx.content || ctx}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.entities && result.entities.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
              <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Entities Found</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {result.entities.map((entity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-[10px] sm:text-xs"
                  >
                    {entity.name || entity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.reasoning_path && result.reasoning_path.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
              <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Reasoning Path</h4>
              <div className="space-y-1">
                {result.reasoning_path.map((step, index) => (
                  <div key={index} className="flex items-start sm:items-center gap-2 text-[10px] sm:text-xs">
                    <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] sm:text-xs">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
