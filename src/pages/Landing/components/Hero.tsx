export default function Hero() {
  return (
    <section className="hero">
      <div className="eyebrow">Portfolio · 2026</div>
      <h1 className="hero-title">
        Warp Into
        <br />
        The Work
      </h1>
      <p className="hero-sub">
        실무에서 만든 10개의 툴과 대시보드. 마케팅 자동화부터 사내 인프라까지,
        빠른 속도로 문제를 해결한 프로젝트들을 모았습니다.
      </p>
      <div className="hero-cta">
        {/* same-page anchors, keep as plain <a> not react-router Link */}
        <a className="btn btn-primary" href="#projects">
          프로젝트 보기
        </a>
        <a className="btn btn-ghost" href="#contact">
          연락하기
        </a>
      </div>
      <div className="scroll-cue">scroll to accelerate ↓</div>
    </section>
  )
}
