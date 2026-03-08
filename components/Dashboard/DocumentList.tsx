import Link from "next/link"

interface Doc {
  id: string
  title: string
  author?: string
  lastModified?: string
  starred?: boolean
}

interface DocumentListProps {
  docs: Doc[]
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function DocumentList({ docs }: DocumentListProps) {
  return (
    <div className="doc-grid">
      {docs.map((doc) => (
        <Link key={doc.id} href={`/editor/${doc.id}`} className="doc-card">
          {/* Thumbnail preview */}
          <div className="doc-thumb">
            <div className="thumb-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="thumb-cell" />
              ))}
            </div>
          </div>
          {/* Card info */}
          <div className="doc-info">
            <div className="doc-title-row">
              <svg className="doc-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d6ce0" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span className="doc-name">{doc.title}</span>
            </div>
            <div className="doc-meta">
              {doc.author && <span className="doc-author">{doc.author}</span>}
              {doc.lastModified && (
                <span className="doc-time">{timeAgo(doc.lastModified)}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
