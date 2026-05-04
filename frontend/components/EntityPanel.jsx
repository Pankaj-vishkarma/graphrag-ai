'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Loader2, Network } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { getEntity } from '@/lib/api'

export default function EntityPanel({ entity, onClose, onSelectRelated }) {
  const [entityDetails, setEntityDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (entity?.name || entity?.id) {
      loadEntityDetails()
    }
  }, [entity])

  const loadEntityDetails = async () => {
    setIsLoading(true)
    try {
      const details = await getEntity(entity.name || entity.id)
      setEntityDetails(details)
    } catch (error) {
      console.error('[v0] Failed to load entity details:', error)
      setEntityDetails(entity)
    } finally {
      setIsLoading(false)
    }
  }

  if (!entity) return null

  const data = entityDetails || entity

  const getTypeColor = (type) => {
    const colors = {
      person: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      organization: 'bg-green-500/10 text-green-500 border-green-500/20',
      location: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    }
    return colors[type?.toLowerCase()] || 'bg-muted text-muted-foreground'
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl max-h-[70vh] sm:max-h-none overflow-hidden flex flex-col">
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6 flex-shrink-0">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold truncate">
              {data.name || data.label || data.id}
            </CardTitle>
            {data.type && (
              <Badge variant="outline" className={`mt-1.5 sm:mt-2 capitalize text-xs ${getTypeColor(data.type)}`}>
                {data.type}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6 pt-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-full max-h-[calc(70vh-100px)] sm:max-h-[400px] pr-2 sm:pr-4">
            {data.description && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-muted-foreground">Description</h4>
                <p className="text-xs sm:text-sm">{data.description}</p>
              </div>
            )}

            {data.properties && Object.keys(data.properties).length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-muted-foreground">Properties</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  {Object.entries(data.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs sm:text-sm gap-2">
                      <span className="text-muted-foreground capitalize truncate">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.relationships && data.relationships.length > 0 && (
              <>
                <Separator className="my-3 sm:my-4" />
                <div>
                  <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2">
                    <Network className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Relationships ({data.relationships.length})
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    {data.relationships.slice(0, 10).map((rel, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer gap-2"
                        onClick={() => onSelectRelated && onSelectRelated(rel.target || rel.entity)}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                            {rel.type || rel.relationship}
                          </Badge>
                          <span className="text-xs sm:text-sm truncate">{rel.target?.name || rel.entity || rel.name}</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))}
                    {data.relationships.length > 10 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground text-center pt-2">
                        +{data.relationships.length - 10} more relationships
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {data.sources && data.sources.length > 0 && (
              <>
                <Separator className="my-3 sm:my-4" />
                <div>
                  <h4 className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-muted-foreground">Sources</h4>
                  <div className="space-y-1">
                    {data.sources.map((source, index) => (
                      <p key={index} className="text-[10px] sm:text-xs text-muted-foreground">
                        {source}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
