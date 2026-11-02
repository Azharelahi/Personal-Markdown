import { useMemo, useState } from 'react'
import { ArrowDownWideNarrow, ArrowUpRight, FilePlus2, Search, X } from 'lucide-react'
import { Link, useLocation, useOutletContext } from 'react-router-dom'
import { useNotesStore } from '../store/notes'
import type { Note } from '../types'

type LayoutContext = {
  query: string
  setQuery: (value: string) => void
  createNote: () => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date))

const excerpt = (text: string) =>
  text.replace(/[#>*_\-[\]`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 130)

function NoteCard({ note }: { note: Note }) {
  return (
    <Link to={`/notes/${note.id}`} className="note-card">
      <div className="note-card-top">
        <span className={`category-pill category-${note.category.toLowerCase()}`}>{note.category}</span>
        <span className="note-date">{formatDate(note.updatedAt)}</span>
      </div>
      <h2>{note.title || 'Untitled note'}</h2>
      <p className="note-excerpt">{excerpt(note.content) || 'No content yet. Click to start writing...'}</p>
      <div className="note-card-footer">
        <div className="note-tags">
          {note.tags.slice(0, 2).map((tag) => <span className="note-tag" key={tag}>#{tag}</span>)}
          {note.tags.length > 2 && <span className="more-tags">+{note.tags.length - 2}</span>}
        </div>
        <ArrowUpRight size={16} className="card-arrow" />
      </div>
    </Link>
  )
}

export default function NotesPage() {
  const notes = useNotesStore((state) => state.notes)
  const { query, setQuery, createNote } = useOutletContext<LayoutContext>()
  const [sortByTitle, setSortByTitle] = useState(false)
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const category = params.get('category')
  const tag = params.get('tag')
  const heading = category ?? (tag ? `# ${tag}` : 'All notes')
  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return [...notes]
      .filter((note) => !category || note.category === category)
      .filter((note) => !tag || note.tags.includes(tag))
      .filter((note) =>
        !needle ||
        `${note.title} ${note.content} ${note.category} ${note.tags.join(' ')}`.toLowerCase().includes(needle),
      )
      .sort((a, b) => sortByTitle
        ? (a.title || 'Untitled note').localeCompare(b.title || 'Untitled note')
        : b.updatedAt.localeCompare(a.updatedAt))
  }, [notes, query, category, tag, sortByTitle])

  return (
    <section className="notes-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> A LITTLE CLARITY, EVERY DAY</div>
          <h1>{heading}<span className="heading-period">.</span></h1>
          <p className="page-subtitle">A quiet place for everything on your mind.</p>
        </div>
        <button className="create-note-button" onClick={createNote}><FilePlus2 size={17} /> Create a note</button>
      </div>

      <div className="notes-toolbar">
        <div className="results-label">{filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} <span>to come back to</span></div>
        <div className="toolbar-right">
          {query && (
            <button className="filter-chip" onClick={() => setQuery('')}>
              <Search size={13} /> “{query}” <X size={13} />
            </button>
          )}
          <button
            className="sort-label"
            onClick={() => setSortByTitle((current) => !current)}
            aria-label={`Sort by ${sortByTitle ? 'recently edited' : 'title'}`}
            title="Switch sort order"
          >
            <ArrowDownWideNarrow size={15} />
            {sortByTitle ? 'Title A–Z' : 'Recently edited'}
          </button>
        </div>
      </div>

      {filteredNotes.length > 0 ? (
        <div className="notes-grid">{filteredNotes.map((note) => <NoteCard key={note.id} note={note} />)}</div>
      ) : (
        <div className="empty-state">
          <div className="empty-illustration"><Search size={24} /></div>
          <h2>{query ? 'No notes found' : 'Nothing here just yet'}</h2>
          <p>{query ? 'Try another search, or clear it to see all your notes.' : 'Start with a thought, a list, or anything you want to remember.'}</p>
          {query
            ? <button className="secondary-button" onClick={() => setQuery('')}>Clear search</button>
            : <button className="create-note-button" onClick={createNote}><FilePlus2 size={17} /> Create your first note</button>}
        </div>
      )}
    </section>
  )
}
