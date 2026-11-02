import { useMemo, useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  Command,
  FileText,
  Hash,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  BriefcaseBusiness,
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
  const notes = useNotesStore((state) => state.notes)
  const addNote = useNotesStore((state) => state.addNote)
  const location = useLocation()
  const navigate = useNavigate()
  const allTags = useMemo(
    () => [...new Set(notes.flatMap((note) => note.tags))].sort((a, b) => a.localeCompare(b)),
    [notes],
  )

  const createNote = () => {
    const id = addNote()
    navigate(`/notes/${id}`)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Papertrail home">
          <span className="brand-mark"><span /></span>
          <span>papertrail by Azhar</span>
        </NavLink>

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
            className={({ isActive }) =>
              `nav-item ${isActive && !new URLSearchParams(location.search).has('category') && !new URLSearchParams(location.search).has('tag') ? 'active' : ''}`
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
              className={({ isActive }) =>
                `nav-item ${isActive && new URLSearchParams(location.search).get('category') === name ? 'active' : ''}`
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
              className={({ isActive }) =>
                `tag-nav-item ${isActive && new URLSearchParams(location.search).get('tag') === tag ? 'active' : ''}`
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
            <label className="search-box">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search anything..."
                aria-label="Search notes"
              />
              <span className="search-shortcut"><Command size={11} /> K</span>
            </label>
            <button className="top-new-button" onClick={createNote}><Plus size={16} /><span>New note</span></button>
          </div>
        </header>
        <Outlet context={{ query, setQuery, createNote }} />
      </main>
      <div className="background-glow" aria-hidden="true" />
      <Sparkles className="decorative-sparkle" size={16} aria-hidden="true" />
    </div>
  )
}
