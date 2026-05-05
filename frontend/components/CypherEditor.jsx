'use client'

import { useState } from 'react'
import { Play, Loader2, Terminal, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { executeCypher } from '@/lib/api'
import { toast } from 'sonner'

const EXAMPLE_QUERIES = [
  {
    label: 'All Persons',
    query: `
      MATCH (n:Entity)
      WHERE n.type = "Person"
      RETURN n
      LIMIT 25
    `
  },
  {
    label: 'All Relationships',
    query: `
      MATCH (a:Entity)-[r]->(b:Entity)
      RETURN a, r, b
      LIMIT 50
    `
  },
  {
    label: 'Most Connected',
    query: `
      MATCH (n:Entity)
      RETURN n, COUNT { (n)--() } as degree
      ORDER BY degree DESC
      LIMIT 10
    `
  }
];

export default function CypherEditor({ className = '' }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleExecute = async () => {
    if (!query.trim()) {
      toast.error('Please enter a Cypher query')
      return
    }

    setIsExecuting(true)
    try {
      const data = await executeCypher(query)
      setResult(data)
      toast.success('Query executed successfully')
    } catch (error) {
      console.error('[v0] Cypher execution error:', error)
      toast.error(error.message || 'Failed to execute query')
      setResult({ error: error.message })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Cypher Query Editor</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((example) => (
            <Button
              key={example.label}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setQuery(example.query)}
            >
              {example.label}
            </Button>
          ))}
        </div>

        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="MATCH (n) RETURN n LIMIT 10"
          className="font-mono text-sm min-h-[120px] bg-background/50"
        />

        <Button
          onClick={handleExecute}
          disabled={isExecuting || !query.trim()}
          className="w-full gap-2"
        >
          {isExecuting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Execute Query
        </Button>

        {result && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Result</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <ScrollArea className="h-[200px] rounded-lg bg-muted/30 p-3">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
