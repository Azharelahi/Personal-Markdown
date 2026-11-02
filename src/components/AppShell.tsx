import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  Command,
  FileText,
  Hash,
  Lightbulb,
  Menu,
  Plus,
  Search,
  Sparkles,
  BriefcaseBusiness,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useNotesStore } from '../store/notes'

const categoryItems = [
  { name: 'Personal', icon: BookOpen },
  { name: 'Work', icon: BriefcaseBusiness },
  { name: 'Ideas', icon: Lightbulb },
  { name: 'Journal', icon: FileText },
]

export default function AppShell() {
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const notes = useNotesStore((state) => state.notes)
  const addNote = useNotesStore((state) => state.addNote)
  const location = useLocation()
  const navigate = useNavigate()
  const allTags = useMemo(
    () => [...new Set(notes.flatMap((note) => note.tags))].sort((a, b) => a.localeCompare(b)),
    [notes],
  )

  const createNote = () => {
    setMobileMenuOpen(false)
    const id = addNote()
    setNotice('A fresh page, just for you.')
    navigate(`/notes/${id}`)
  }

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2400)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-menu-backdrop"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
        />
      )}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} id="app-navigation">
        <NavLink to="/" className="brand" aria-label="Papertrail home">
          <span className="brand-mark"><span /></span>
          <span>papertrail by Azhar</span>
        </NavLink>
        <button className="mobile-drawer-close" onClick={closeMobileMenu} aria-label="Close navigation menu">
          <X size={18} />
        </button>

        <button className="new-note-button" onClick={createNote}>
          <Plus size={17} strokeWidth={2.2} />
          <span>New note</span>
          <span className="shortcut-hint">⌘ N</span>
        </button>

        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            onClick={closeMobileMenu}
            className={() =>
              `nav-item ${location.pathname === '/' && !new URLSearchParams(location.search).has('category') && !new URLSearchParams(location.search).has('tag') ? 'active' : ''}`
            }
          >
            <FileText size={17} />
            <span>All notes</span>
            <span className="nav-count">{notes.length}</span>
          </NavLink>
        </nav>

        <div className="sidebar-label category-label">
          <span>COLLECTIONS</span>
          <ChevronDown size={13} />
        </div>
        <nav className="primary-nav" aria-label="Note collections">
          {categoryItems.map(({ name, icon: Icon }) => (
            <NavLink
              key={name}
              to={`/?category=${encodeURIComponent(name)}`}
              onClick={closeMobileMenu}
              className={() =>
                `nav-item ${new URLSearchParams(location.search).get('category') === name ? 'active' : ''}`
              }
            >
              <Icon size={17} />
              <span>{name}</span>
              <span className="nav-count">{notes.filter((note) => note.category === name).length}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-label tags-label">TAGS</div>
        <div className="tag-list">
          {allTags.length > 0 ? allTags.map((tag) => (
            <NavLink
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              onClick={closeMobileMenu}
              className={() =>
                `tag-nav-item ${new URLSearchParams(location.search).get('tag') === tag ? 'active' : ''}`
              }
            >
              <Hash size={14} />
              <span>{tag}</span>
            </NavLink>
          )) : <span className="empty-tags">Tags you add will appear here</span>}
        </div>

        <div className="sidebar-bottom">
          <div className="local-status"><span className="status-dot" /> Everything is saved locally</div>
          <div className="profile-card">
            <div className="avatar">Y</div>
            <div className="profile-copy"><strong>Your workspace</strong><span>Personal space</span></div>
            <ChevronDown size={15} className="profile-chevron" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{location.pathname.startsWith('/notes/') ? 'Editor' : 'Notes'}</strong></div>
          <div className="topbar-actions">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="app-navigation"
            >
              <Menu size={19} />
            </button>
            <label className="search-box">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search anything..."
                aria-label="Search notes"
              />
              {query
                ? <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>
                : <span className="search-shortcut"><Command size={11} /> K</span>}
            </label>
            <button className="top-new-button" onClick={createNote}><Plus size={16} /><span>New note</span></button>
          </div>
        </header>
        <Outlet context={{ query, setQuery, createNote }} />
        {notice && (
          <div className="app-toast" role="status" aria-live="polite">
            <span className="toast-check"><Sparkles size={14} /></span>
            {notice}
          </div>
        )}
      </main>
      <div className="background-glow" aria-hidden="true" />
      <Sparkles className="decorative-sparkle" size={16} aria-hidden="true" />
    </div>
  )
}
