'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import ComparisonView from '@/components/ComparisonView'
import { useCompareStore } from '@/lib/store'
import { queryCompare } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, GitCompare, Sparkles, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function ComparePage() {
  const [query, setQuery] = useState('')
  const {
    graphResult,
    vectorResult,
    hybridResult,
    isComparing,
    setCompareResults,
    setIsComparing,
    clearResults,
  } = useCompareStore()

  const handleCompare = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query to compare')
      return
    }

    setIsComparing(true)
    clearResults()

    try {
      const results = await queryCompare(query)

      setCompareResults(
        {
          answer: results.graph_answer,
          score: results.graph_score,
        },
        {
          answer: results.vector_answer,
          score: results.vector_score,
        },
        {
          answer: results.hybrid_answer,
          score: results.hybrid_score,
        }
      )

      toast.success('Comparison complete')
    } catch (error) {
      console.error('[v0] Comparison error:', error)
      toast.error(error.message || 'Failed to compare methods')
    } finally {
      setIsComparing(false)
    }
  }

  const hasResults = graphResult || vectorResult || hybridResult

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <GitCompare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Compare Retrieval Methods</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                See how Graph RAG, Vector Search, and Hybrid methods compare
              </p>
            </div>
          </div>
        </div>

        {/* Query Input */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Enter Your Query</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              The same query will be sent to all three retrieval methods for comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-3 sm:space-y-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question to compare retrieval methods..."
                className="min-h-[80px] sm:min-h-[100px] resize-none bg-background/50 text-sm sm:text-base"
                disabled={isComparing}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>Results will show answer quality, response time, and context used</span>
                </div>
                <Button
                  onClick={handleCompare}
                  disabled={!query.trim() || isComparing}
                  className="gap-2 w-full sm:w-auto"
                >
                  {isComparing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Comparing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Compare Methods
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isComparing && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
            </div>
            <p className="mt-6 text-lg font-medium">Running comparison...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Querying Graph RAG, Vector Search, and Hybrid methods
            </p>
          </div>
        )}

        {!isComparing && hasResults && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold">Results Comparison</h2>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">Graph RAG</Badge>
                <Badge variant="outline" className="text-xs">Vector Search</Badge>
                <Badge variant="outline" className="text-xs">Hybrid</Badge>
              </div>
            </div>

            <ComparisonView
              graphResult={graphResult}
              vectorResult={vectorResult}
              hybridResult={hybridResult}
            />
          </div>
        )}

        {!isComparing && !hasResults && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <GitCompare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Comparison Yet</h2>
            <p className="text-muted-foreground max-w-md">
              Enter a query above and click &quot;Compare Methods&quot; to see how different
              retrieval approaches handle your question.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
