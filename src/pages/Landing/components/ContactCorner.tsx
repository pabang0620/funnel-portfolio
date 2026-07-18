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
        <a className="cc-link" href="mailto:lwh970924@gmail.com">
          <span className="cc-icon" aria-hidden="true">
            ✉
          </span>
          이메일 보내기
        </a>
        <a
          className="cc-link"
          href="https://github.com/pabang0620"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="cc-icon" aria-hidden="true">
            ◆
          </span>
          GitHub
        </a>
      </nav>
    </div>
  )
}
