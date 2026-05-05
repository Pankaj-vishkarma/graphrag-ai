'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Network } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function CommunityView({ community, onExpand, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!community) return null

  const entityCount = community.entities?.length || community.entity_count || 0

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden transition-all hover:shadow-lg ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <CardTitle className="text-sm sm:text-base font-semibold truncate">
                  {community.label || community.name || `Community ${community.id}`}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  {entityCount} entities
                </Badge>
                {community.density && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    Density: {(community.density * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 h-7 w-7 sm:h-9 sm:w-9">
                {isOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 p-3 sm:p-6">
            {community.summary && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {community.summary}
              </p>
            )}

            {community.entities && community.entities.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1.5 sm:mb-2">Members</p>
                <ScrollArea className="h-[100px] sm:h-[120px]">
                  <div className="flex flex-wrap gap-1">
                    {community.entities.map((entity, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-[10px] sm:text-xs cursor-pointer hover:bg-primary/10"
                      >
                        {entity.name || entity}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {community.key_relationships && community.key_relationships.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1.5 sm:mb-2">Key Relationships</p>
                <div className="space-y-1">
                  {community.key_relationships.slice(0, 3).map((rel, index) => (
                    <p key={index} className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {rel.source} → {rel.type} → {rel.target}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="w-full gap-2 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => onExpand && onExpand(community)}
            >
              <Network className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              View in Graph
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
