// Simplified RichTextEditor for portfolio demo
// Full TipTap editor is available in the production version.
// This version renders/edits plain HTML content.

interface RichTextEditorProps {
  content: string
  onChange?: (value: string) => void
  editable?: boolean
  placeholder?: string
  showToc?: boolean
  assignmentId?: string
}

export default function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = '내용을 입력하세요...',
}: RichTextEditorProps) {
  if (!editable) {
    if (!content) return null
    return (
      <div
        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-1 flex-wrap">
        {['B', 'I', 'U', 'H1', 'H2', '• 목록', '링크'].map(tool => (
          <button
            key={tool}
            type="button"
            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors cursor-pointer font-mono"
          >
            {tool}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={8}
        className="w-full px-4 py-3 text-sm text-gray-700 focus:outline-none resize-y bg-white"
      />
    </div>
  )
}
