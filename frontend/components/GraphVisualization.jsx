'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useGraphStore } from '@/lib/store'

const NODE_COLORS = {
  person: '#6366f1',
  organization: '#22c55e',
  location: '#f97316',
  default: '#64748b',
}

const NODE_COLORS_DARK = {
  person: '#818cf8',
  organization: '#4ade80',
  location: '#fb923c',
  default: '#94a3b8',
}

export default function GraphVisualization({ 
  onNodeClick, 
  width, 
  height,
  className = '',
}) {
  const graphRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isDark, setIsDark] = useState(false)
  const [hoveredNode, setHoveredNode] = useState(null)
  
  const { 
    nodes, 
    links, 
    highlightedNodes, 
    highlightedLinks,
    getFilteredNodes,
    getFilteredLinks,
  } = useGraphStore()

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: width || containerRef.current.offsetWidth,
          height: height || containerRef.current.offsetHeight,
        })
      }
    }
    
    updateDimensions()
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)
    
    return () => resizeObserver.disconnect()
  }, [width, height])

  const getNodeColor = useCallback((node) => {
    const colors = isDark ? NODE_COLORS_DARK : NODE_COLORS
    const type = (node.type || 'default').toLowerCase()
    
    if (highlightedNodes.has(node.id)) {
      return isDark ? '#f472b6' : '#ec4899'
    }
    
    return colors[type] || colors.default
  }, [isDark, highlightedNodes])

  const getNodeSize = useCallback((node) => {
    const baseSize = 6
    const degree = node.degree || node.connections || 1
    return baseSize + Math.min(degree * 0.5, 8)
  }, [])

  const getLinkColor = useCallback((link) => {
    const linkId = `${link.source?.id || link.source}-${link.target?.id || link.target}`
    if (highlightedLinks.has(linkId)) {
      return isDark ? '#f472b6' : '#ec4899'
    }
    return isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.3)'
  }, [isDark, highlightedLinks])

  const getLinkWidth = useCallback((link) => {
    const linkId = `${link.source?.id || link.source}-${link.target?.id || link.target}`
    return highlightedLinks.has(linkId) ? 2 : 1
  }, [highlightedLinks])

  const handleNodeClick = useCallback((node) => {
    if (onNodeClick) {
      onNodeClick(node)
    }
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 500)
      graphRef.current.zoom(2, 500)
    }
  }, [onNodeClick])

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node)
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'grab'
    }
  }, [])

  const filteredNodes = getFilteredNodes()
  const filteredLinks = getFilteredLinks()

  const graphData = {
    nodes: filteredNodes.length > 0 ? filteredNodes : nodes,
    links: filteredLinks.length > 0 ? filteredLinks : links,
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full min-h-[400px] ${className}`}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeColor={getNodeColor}
        nodeVal={getNodeSize}
        nodeLabel={(node) => node.name || node.label || node.id}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link) => {
          const linkId = `${link.source?.id || link.source}-${link.target?.id || link.target}`
          return highlightedLinks.has(linkId) ? 2 : 0
        }}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        backgroundColor="transparent"
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name || node.label || ''
          const fontSize = 12 / globalScale
          ctx.font = `${fontSize}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b'
          
          if (globalScale > 1 || highlightedNodes.has(node.id)) {
            ctx.fillText(label, node.x, node.y + getNodeSize(node) + 4)
          }
        }}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
      
      {hoveredNode && (
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-card/90 backdrop-blur-sm border border-border shadow-lg max-w-xs">
          <p className="font-medium text-card-foreground">{hoveredNode.name || hoveredNode.label}</p>
          {hoveredNode.type && (
            <p className="text-sm text-muted-foreground capitalize">{hoveredNode.type}</p>
          )}
          {hoveredNode.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{hoveredNode.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
