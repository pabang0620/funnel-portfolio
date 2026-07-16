import { useEffect } from 'react'
import './landing-theme.css'
import HyperspaceBackground from './components/HyperspaceBackground'
import Hero from './components/Hero'
import ProjectGrid from './components/ProjectGrid'
import Footer from './components/Footer'

export default function Landing() {
  useEffect(() => {
    document.body.classList.add('landing-body')
    return () => {
      document.body.classList.remove('landing-body')
    }
  }, [])

  return (
    <div className="landing-hyperspace">
      <HyperspaceBackground />
      <main>
        <Hero />
        <ProjectGrid />
        <Footer />
      </main>
    </div>
  )
}
