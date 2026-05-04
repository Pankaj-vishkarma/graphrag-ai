import { create } from 'zustand'

export const useGraphStore = create((set, get) => ({
  // Graph data
  nodes: [],
  links: [],
  highlightedNodes: new Set(),
  highlightedLinks: new Set(),
  selectedNode: null,
  
  // Query state
  queryResult: null,
  isQuerying: false,
  queryMethod: 'hybrid',
  
  // Filters
  entityTypeFilter: [],
  relationshipTypeFilter: [],
  searchQuery: '',
  
  // Stats
  stats: null,
  
  // Actions
  setGraphData: (nodes, links) => set({ nodes, links }),
  
  setHighlightedNodes: (nodeIds) => set({ 
    highlightedNodes: new Set(nodeIds) 
  }),
  
  setHighlightedLinks: (linkIds) => set({ 
    highlightedLinks: new Set(linkIds) 
  }),
  
  clearHighlights: () => set({ 
    highlightedNodes: new Set(), 
    highlightedLinks: new Set() 
  }),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  setQueryResult: (result) => set({ queryResult: result }),
  
  setIsQuerying: (isQuerying) => set({ isQuerying }),
  
  setQueryMethod: (method) => set({ queryMethod: method }),
  
  setEntityTypeFilter: (types) => set({ entityTypeFilter: types }),
  
  setRelationshipTypeFilter: (types) => set({ relationshipTypeFilter: types }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setStats: (stats) => set({ stats }),
  
  // Computed
  getFilteredNodes: () => {
    const { nodes, entityTypeFilter, searchQuery } = get()
    let filtered = nodes
    
    if (entityTypeFilter.length > 0) {
      filtered = filtered.filter(node => 
        entityTypeFilter.includes(node.type || 'unknown')
      )
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(node => 
        node.name?.toLowerCase().includes(query) ||
        node.label?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  },
  
  getFilteredLinks: () => {
    const { links, relationshipTypeFilter, nodes, entityTypeFilter, searchQuery } = get()
    const filteredNodeIds = new Set(
      get().getFilteredNodes().map(n => n.id)
    )
    
    let filtered = links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId)
    })
    
    if (relationshipTypeFilter.length > 0) {
      filtered = filtered.filter(link => 
        relationshipTypeFilter.includes(link.type || link.label || 'unknown')
      )
    }
    
    return filtered
  },
}))

export const useCompareStore = create((set) => ({
  graphResult: null,
  vectorResult: null,
  hybridResult: null,
  isComparing: false,
  
  setCompareResults: (graph, vector, hybrid) => set({
    graphResult: graph,
    vectorResult: vector,
    hybridResult: hybrid,
  }),
  
  setIsComparing: (isComparing) => set({ isComparing }),
  
  clearResults: () => set({
    graphResult: null,
    vectorResult: null,
    hybridResult: null,
  }),
}))

export const useDocumentStore = create((set) => ({
  documents: [],
  isUploading: false,
  uploadProgress: null,
  
  setDocuments: (documents) => set({ documents }),
  
  addDocument: (document) => set((state) => ({
    documents: [...state.documents, document],
  })),
  
  setIsUploading: (isUploading) => set({ isUploading }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
}))
