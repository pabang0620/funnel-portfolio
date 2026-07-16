import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '@/data/projects'
import { useInViewOnce } from '../hooks/useInViewOnce'
import { useCardTilt } from '../hooks/useCardTilt'

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  // Entrance-reveal ref and tilt-listener ref target the SAME outer element
  // (matches the mockup's `.card-drift` wrapper doing both jobs).
  const { ref: inViewRef, inView } = useInViewOnce<HTMLDivElement>()
  const { wrapperRef, innerRef } = useCardTilt<HTMLDivElement, HTMLAnchorElement>()

  // FIX: suggestion-3 useCallback to prevent ref callback recreation on every render
  const setOuterRef = useCallback(
    (node: HTMLDivElement | null) => {
      inViewRef.current = node
      wrapperRef.current = node
    },
    [inViewRef, wrapperRef]
  )

  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <div ref={setOuterRef} className={`card-drift${inView ? ' in-view' : ''}`}>
      <Link to={project.path} ref={innerRef} className="card-tilt">
        <div className="card-index">{indexLabel}</div>
        <div className="card-arrow">↗</div>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <span className="card-tag">{project.tag}</span>
      </Link>
    </div>
  )
}
