export default function Footer() {
  return (
    <footer id="contact">
      <h2>Let&apos;s build something fast.</h2>
      <p>새로운 프로젝트나 협업 제안은 언제든 환영합니다.</p>
      <div className="hero-cta">
        {/* TODO: replace with real contact email / resume link */}
        <a className="btn btn-primary" href="#">
          이메일 보내기
        </a>
        {/* TODO: replace with real contact email / resume link */}
        <a className="btn btn-ghost" href="#">
          이력서 보기
        </a>
      </div>
      <div className="footer-meta">Portfolio · Wormhole Hyperspace</div>
    </footer>
  )
}
