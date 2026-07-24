/**
 * Fixed bottom-center "about this demo" block for English-speaking visitors
 * (recruiters landing here from a resume/GitHub/LinkedIn link). Sits in the
 * same fixed, non-scrolling viewport as the rest of the scene — see the
 * note at the top of landing-theme.css. Deliberately `pointer-events: none`
 * (see .intro-panel in landing-theme.css) so it never steals clicks from a
 * planet that happens to wander underneath it.
 */
export default function IntroPanel() {
  return (
    <div className="intro-panel">
      <span className="ip-corner ip-tl" aria-hidden="true" />
      <span className="ip-corner ip-tr" aria-hidden="true" />
      <span className="ip-corner ip-bl" aria-hidden="true" />
      <span className="ip-corner ip-br" aria-hidden="true" />
      <p className="ip-eyebrow">About this demo</p>
      <h2 className="ip-title">Ten internal tools, rebuilt as one live demo</h2>
      <p className="ip-body">
        I built these as the only engineer at a 150-person marketing agency, where 120 people used
        them every day — a no-code page builder, an internal CRM, an ad-performance dashboard, and
        more. The original code belongs to the company, so I rebuilt the tooling here with sample
        data.
      </p>
      <p className="ip-guide">No login. Click any planet to open a tool.</p>
      <p className="ip-note">Module UI text is in Korean, as the originals were.</p>
    </div>
  )
}
