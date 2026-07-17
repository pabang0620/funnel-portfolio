/**
 * Persistent top-left contact widget — replaces the old scrolling Footer
 * entirely (client instruction: "연락처 그런건 왼쪽상단에 느낌있게 넣어줘").
 * Reuses the previous Footer's actual link intent (email / resume), just
 * condensed into a compact, always-visible, holographic corner tag instead
 * of a full footer section. Sits in its own stacking layer with
 * `pointer-events: auto` (see landing-theme.css) so its links are always
 * clickable regardless of the WebGL canvas layered beneath it.
 */
export default function ContactCorner() {
  return (
    <div className="contact-corner">
      <span className="cc-corner cc-tl" aria-hidden="true" />
      <span className="cc-corner cc-tr" aria-hidden="true" />
      <span className="cc-corner cc-bl" aria-hidden="true" />
      <span className="cc-corner cc-br" aria-hidden="true" />
      <div className="cc-tag">Contact</div>
      <nav className="cc-links" aria-label="연락처">
        {/* TODO: replace with real contact email link */}
        <a className="cc-link" href="#">
          <span className="cc-icon" aria-hidden="true">
            ✉
          </span>
          이메일 보내기
        </a>
        {/* TODO: replace with real resume link */}
        <a className="cc-link" href="#">
          <span className="cc-icon" aria-hidden="true">
            ▤
          </span>
          이력서 보기
        </a>
      </nav>
    </div>
  )
}
