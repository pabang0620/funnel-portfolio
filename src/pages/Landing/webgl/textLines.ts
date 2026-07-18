/**
 * Splits `text` into the substrings that actually render as separate VISUAL
 * lines inside `measureEl` at its CURRENT width/font/line-height — using the
 * DOM Range API to read each character's real bounding rect, rather than
 * guessing line breaks from a character-count heuristic (which would be
 * wrong across different screen widths and font rendering).
 *
 * Technique: `measureEl`'s text is set to a single text node, then for each
 * character offset a zero-width Range is created around just that character
 * and `range.getClientRects()` is read. When a character's rect `top` is
 * greater than the current line's `top`, that character starts a new visual
 * line — this is the standard "measure actual wrap points via Range" trick.
 *
 * Mutates `measureEl.textContent` as a side effect of measuring (callers
 * that need `measureEl` to end up holding per-line child elements should
 * call `renderTextAsLines` instead, which handles that rebuild).
 */
export function splitIntoVisualLines(measureEl: HTMLElement, text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  measureEl.textContent = trimmed
  const textNode = measureEl.firstChild
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return [trimmed]

  const range = document.createRange()
  const len = trimmed.length
  const lines: string[] = []
  let lineStart = 0
  let lineTop: number | null = null

  for (let i = 0; i < len; i++) {
    range.setStart(textNode, i)
    range.setEnd(textNode, i + 1)
    const rect = range.getClientRects()[0]
    if (!rect) continue // collapsed/invisible char (e.g. a wrapped trailing space) — ignore

    if (lineTop === null) {
      lineTop = rect.top
      continue
    }
    if (Math.round(rect.top) > Math.round(lineTop)) {
      // this character starts a new visual line — the break is right before it
      lines.push(trimmed.slice(lineStart, i).trim())
      lineStart = i
      lineTop = rect.top
    }
  }
  lines.push(trimmed.slice(lineStart).trim())

  return lines.filter((line) => line.length > 0)
}

/**
 * Rebuilds `containerEl`'s children as one block element per actually
 * rendered visual line of `text` (via `splitIntoVisualLines`, measured
 * against `containerEl` itself so the split matches its real width/font),
 * each tagged with `lineClassName` so the caller's reveal-cascade timers can
 * stagger them individually. Falls back to a single line for empty/
 * unmeasurable text, so short one-line descriptions still degrade
 * gracefully to the old single-block reveal. Always clears any previously
 * rendered lines first, so re-opening the panel for the same or a new
 * planet never accumulates stale spans.
 */
export function renderTextAsLines(containerEl: HTMLElement, text: string, lineClassName: string): void {
  const lines = splitIntoVisualLines(containerEl, text)
  containerEl.textContent = ''
  const source = lines.length > 0 ? lines : [text.trim()].filter(Boolean)
  source.forEach((line) => {
    const div = document.createElement('div')
    div.className = lineClassName
    div.textContent = line
    containerEl.appendChild(div)
  })
}
