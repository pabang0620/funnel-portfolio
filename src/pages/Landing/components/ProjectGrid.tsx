import { PROJECTS } from '@/data/projects'
import ProjectCard from './ProjectCard'

export default function ProjectGrid() {
  return (
    <section className="section" id="projects">
      <div className="section-head">
        <div className="eyebrow">Selected Work</div>
        <h2>10 Projects</h2>
        <p>스크롤할수록 터널의 속도가 빨라집니다. 카드에 마우스를 올려 기울여보세요.</p>
      </div>

      <div className="projects-grid">
        {PROJECTS.map((project, index) => (
          <ProjectCard key={project.key} project={project} index={index} />
        ))}
      </div>
    </section>
  )
}
