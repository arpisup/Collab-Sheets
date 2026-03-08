import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import DocumentList from "../components/Dashboard/DocumentList"
import Link from "next/link"
import { useAuthStore } from "../store/authStore"

interface Doc {
  id: string
  title: string
  author?: string
  lastModified?: string
  starred?: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!user) {
      router.replace("/login")
      return
    }
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data: Doc[]) => {
        setDocs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, router])

  if (!user) return null

  const initial = user.displayName.charAt(0).toUpperCase()

  const filtered = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  const starred = filtered.filter((d) => d.starred)
  const recent = filtered.filter((d) => !d.starred)

  return (
    <div className="app-shell">
      {/* ---- Top Navbar ---- */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#1d6ce0" />
              <rect x="5" y="5" width="7" height="7" rx="1.5" fill="#b8d4f0" />
              <rect x="16" y="5" width="7" height="7" rx="1.5" fill="#7ab8f5" />
              <rect x="5" y="16" width="7" height="7" rx="1.5" fill="#7ab8f5" />
              <rect x="16" y="16" width="7" height="7" rx="1.5" fill="#b8d4f0" />
            </svg>
            <span className="logo-text">Sheets</span>
          </div>
        </div>
        <div className="navbar-center">
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search spreadsheets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="navbar-right">
          <span className="navbar-name">{user.displayName}</span>
          <div className="avatar" style={{ background: user.color }} title="Sign out" onClick={() => { clearUser(); router.push("/login") }}>
            {initial}
          </div>
        </div>
      </nav>

      {/* ---- Main Content ---- */}
      <main className="dashboard-main">
        {/* Hero Section */}
        <div className="dash-hero">
          <div className="dash-hero-text">
            <h1 className="dash-title">Welcome back</h1>
            <p className="dash-subtitle">Create, edit, and collaborate on spreadsheets in real time.</p>
          </div>
          <Link href="/editor/new" className="btn-new">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Spreadsheet
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading your spreadsheets…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>No spreadsheets found</p>
          </div>
        ) : (
          <>
            {starred.length > 0 && (
              <section className="doc-section">
                <h2 className="section-heading">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Starred
                </h2>
                <DocumentList docs={starred} />
              </section>
            )}
            <section className="doc-section">
              <h2 className="section-heading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Recent
              </h2>
              <DocumentList docs={recent.length > 0 ? recent : starred} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
