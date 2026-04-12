import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { OrgNode } from '../../types/hr'

interface OrgChartTreeProps {
  data: OrgNode
  onNodeClick: (node: OrgNode) => void
}

const NODE_SIZE: Record<string, { w: number; h: number }> = {
  group:    { w: 180, h: 64 },
  company:  { w: 160, h: 60 },
  dept:     { w: 140, h: 52 },
  division: { w: 160, h: 56 },
  team:     { w: 130, h: 48 },
  part:     { w: 120, h: 44 },
  employee: { w: 110, h: 64 },
}


function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export interface OrgChartTreeHandle {
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

interface Props extends OrgChartTreeProps {
  handleRef?: React.MutableRefObject<OrgChartTreeHandle | null>
}

export function OrgChartTree({ data, onNodeClick, handleRef }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data) return

    const container = containerRef.current
    const W = container.clientWidth
    const H = container.clientHeight

    d3.select(svgRef.current).selectAll('*').remove()

    const svgEl = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H)

    const gEl = svgEl.append('g')

    const root = d3.hierarchy(data)

    const treeLayout = d3.tree<OrgNode>()
      .nodeSize([120, 100])
      .separation((a, b) => {
        const wa = (NODE_SIZE[a.data.type]?.w || 120) / 2
        const wb = (NODE_SIZE[b.data.type]?.w || 120) / 2
        return (wa + wb + 20) / 120
      })

    treeLayout(root)

    // Draw links
    gEl.append('g').attr('class', 'links')
      .selectAll('path')
      .data(root.links())
      .join('path')
        .attr('fill', 'none')
        .attr('stroke', getCSSVar('--border') || '#e4e4e7')
        .attr('stroke-width', 1.5)
        .attr('d', (d) => {
          const sy = d.source.y ?? 0
          const ty = d.target.y ?? 0
          const srcY = sy + (NODE_SIZE[d.source.data.type]?.h || 52) / 2
          const tgtY = ty - (NODE_SIZE[d.target.data.type]?.h || 52) / 2
          return `M${d.source.x},${srcY} C${d.source.x},${(srcY+tgtY)/2} ${d.target.x},${(srcY+tgtY)/2} ${d.target.x},${tgtY}`
        })

    // Draw nodes
    const nodes = gEl.append('g').attr('class', 'nodes')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .attr('tabindex', 0)
        .style('cursor', 'pointer')
        .on('click', (_event, d) => {
          onNodeClick(d.data)
        })

    // Employee nodes
    nodes.filter(d => d.data.type === 'employee').each(function(d) {
      const g = d3.select(this)
      const { w, h } = NODE_SIZE.employee
      g.append('rect')
        .attr('x', -w/2).attr('y', -h/2)
        .attr('width', w).attr('height', h)
        .attr('rx', 8).attr('ry', 8)
        .attr('fill', getCSSVar('--card') || '#fff')
        .attr('stroke', getCSSVar('--border') || '#e4e4e7')
        .attr('stroke-width', 1.5)
        .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))')

      const hasInitial = !!d.data.initial
      const hasLabel = !!d.data.label

      // initial (이니셜)
      if (hasInitial) {
        g.append('text')
          .attr('x', 0).attr('y', hasLabel ? -14 : -8)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10')
          .attr('fill', getCSSVar('--muted-foreground') || '#737373')
          .text(d.data.initial!)
      }

      // name
      g.append('text')
        .attr('x', 0).attr('y', hasInitial ? (hasLabel ? 0 : 5) : (hasLabel ? -6 : 5))
        .attr('text-anchor', 'middle')
        .attr('font-size', '12')
        .attr('font-weight', '600')
        .attr('fill', getCSSVar('--foreground') || '#171717')
        .text(d.data.name)

      // label (employment_type)
      if (hasLabel) {
        g.append('text')
          .attr('x', 0).attr('y', hasInitial ? 14 : 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10')
          .attr('fill', getCSSVar('--muted-foreground') || '#737373')
          .text(d.data.label!)
      }
    })

    // Non-employee nodes
    nodes.filter(d => d.data.type !== 'employee').each(function(d) {
      const g = d3.select(this)
      const { w, h } = NODE_SIZE[d.data.type] || NODE_SIZE.team
      const type = d.data.type

      const fillColor =
        type === 'group'    ? '#1E1B4B' :
        type === 'company'  ? '#4338CA' :
        type === 'division' ? '#2563EB' :
        type === 'team'     ? '#0891B2' :
        type === 'part'     ? '#059669' :
        (getCSSVar('--muted') || '#f5f5f5')

      const strokeColor = 'none'

      const textColor = '#fff'

      const labelColor = 'rgba(255,255,255,0.75)'

      g.append('rect')
        .attr('x', -w/2).attr('y', -h/2)
        .attr('width', w).attr('height', h)
        .attr('rx', 8).attr('ry', 8)
        .attr('fill', fillColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', 1.5)
        .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))')

      g.append('text')
        .attr('x', 0)
        .attr('y', d.data.label ? -4 : 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', type === 'division' ? '14' : type === 'company' ? '13' : '12')
        .attr('font-weight', '600')
        .attr('fill', textColor)
        .text(d.data.name)

      if (d.data.label) {
        g.append('text')
          .attr('x', 0).attr('y', 13)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10')
          .attr('fill', labelColor)
          .text(d.data.label)
      }
    })

    // Zoom setup
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        gEl.attr('transform', event.transform)
      })

    zoomRef.current = zoomBehavior
    svgEl.call(zoomBehavior)

    svgEl.call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(W / 2, 60)
    )

    if (handleRef) {
      handleRef.current = {
        zoomIn: () => {
          svgEl.transition().duration(250).call(zoomBehavior.scaleBy, 1.3)
        },
        zoomOut: () => {
          svgEl.transition().duration(250).call(zoomBehavior.scaleBy, 0.77)
        },
        reset: () => {
          svgEl.transition().duration(300).call(
            zoomBehavior.transform,
            d3.zoomIdentity.translate(W / 2, 60)
          )
        },
      }
    }

    const handleResize = () => {
      const newW = container.clientWidth
      const newH = container.clientHeight
      svgEl.attr('width', newW).attr('height', newH)
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [data, onNodeClick, handleRef])

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative bg-muted"
      style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
