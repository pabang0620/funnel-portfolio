import { useEffect } from 'react'
import './landing-theme.css'
import HyperspaceBackground from './components/HyperspaceBackground'
import PlanetScene from './components/PlanetScene'

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
        <PlanetScene />
      </main>
    </div>
  )
}
