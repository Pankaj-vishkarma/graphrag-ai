'use client'

import { useEffect, useState, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import { useDocumentStore } from '@/lib/store'
import { getDocuments, uploadDocument, deleteDocument } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Upload,
  Loader2,
  File,
  CheckCircle2,
  XCircle,
  Clock,
  Network,
  Link2,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  const {
    documents,
    setDocuments,
    addDocument,
    isUploading,
    setIsUploading,
    uploadProgress,
    setUploadProgress,
  } = useDocumentStore()

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const data = await getDocuments()

      const docs = Array.isArray(data.documents)
        ? data.documents.map(doc => ({
          ...doc,
          status: doc.status === "processed" ? "completed" : doc.status,
          entities: doc.entity_count || 0,
          relationships: doc.relationship_count || 0,
        }))
        : []

      setDocuments(docs)

    } catch (error) {
      console.error('[v0] Failed to load documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        setUploadProgress(Math.round(((i) / files.length) * 100))

        const result = await uploadDocument(file)

        addDocument({
          id: result.id || Date.now(),
          name: file.name,
          status: 'completed',
          entities: result.entity_count || result.entities?.length || 0,
          relationships: result.relationship_count || result.relationships?.length || 0,
          uploadedAt: new Date().toISOString(),
          ...result,
        })

        toast.success(`Uploaded ${file.name}`)
      } catch (error) {
        console.error('[v0] Upload error:', error)
        toast.error(`Failed to upload ${file.name}: ${error.message}`)

        addDocument({
          id: Date.now(),
          name: file.name,
          status: 'failed',
          error: error.message,
          uploadedAt: new Date().toISOString(),
        })
      }
    }

    setUploadProgress(100)
    setTimeout(() => {
      setIsUploading(false)
      setUploadProgress(null)
    }, 1000)
  }

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      await deleteDocument(docId)

      // Update UI safely
      setDocuments(prev =>
        Array.isArray(prev) ? prev.filter(doc => doc.id !== docId) : []
      )

      // Sync with backend (important)
      await loadDocuments()

      toast.success("Document deleted")

    } catch (error) {
      console.error("Delete failed:", error)
      toast.error("Failed to delete document")
    }
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleUpload(files)
  }, [])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleUpload(files)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'processing':
        return <Badge className="bg-primary/10 text-primary">Processing</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Documents</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Upload documents to build your knowledge graph
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Upload Document</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Supports PDF, TXT, DOCX, and MD files
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-lg sm:rounded-xl p-6 sm:p-8 text-center transition-all
                    ${isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }
                    ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  `}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx,.md"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />

                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      )}
                    </div>

                    {isUploading ? (
                      <>
                        <p className="text-xs sm:text-sm font-medium">Uploading...</p>
                        <Progress value={uploadProgress} className="w-full h-1.5 sm:h-2" />
                      </>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm font-medium">
                          {isDragging ? 'Drop files here' : 'Drag & drop files'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          or click to browse
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Processing Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <File className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm">Total Documents</span>
                    </div>
                    <span className="text-sm sm:text-base font-semibold">{Array.isArray(documents) ? documents.length : 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                      <span className="text-xs sm:text-sm">Entities Extracted</span>
                    </div>
                    <span className="text-sm sm:text-base font-semibold">
                      {Array.isArray(documents)
                        ? documents.reduce((sum, doc) => sum + (doc.entities || 0), 0)
                        : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                      <span className="text-xs sm:text-sm">Relationships Found</span>
                    </div>
                    <span className="text-sm sm:text-base font-semibold">
                      {Array.isArray(documents)
                        ? documents.reduce((sum, doc) => sum + (doc.relationships || 0), 0)
                        : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Processed Documents</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Documents that have been processed and added to your knowledge graph
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ScrollArea className="h-[350px] sm:h-[500px] pr-2 sm:pr-4">
                  {isLoading ? (
                    <div className="space-y-3 sm:space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/30">
                          <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 sm:h-4 w-32 sm:w-48" />
                            <Skeleton className="h-2 sm:h-3 w-24 sm:w-32" />
                          </div>
                          <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-4 sm:mb-6">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold mb-2">No Documents Yet</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-md px-4">
                        Upload your first document to start building your knowledge graph.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {Array.isArray(documents) ? documents.map((doc, index) => (
                        <div
                          key={doc.id || index}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {getStatusIcon(doc.status)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium truncate">{doc.name}</p>
                            <div className="flex items-center gap-2 sm:gap-4 mt-1 flex-wrap">
                              {doc.entities > 0 && (
                                <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                  <Network className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  {doc.entities} entities
                                </span>
                              )}
                              {doc.relationships > 0 && (
                                <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                  <Link2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  {doc.relationships} rels
                                </span>
                              )}
                              {doc.uploadedAt && (
                                <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                                  {new Date(doc.uploadedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="hidden sm:block">
                              {getStatusBadge(doc.status)}
                            </div>

                            <div className="block sm:hidden">
                              {getStatusIcon(doc.status)}
                            </div>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                              className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )) : null}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
