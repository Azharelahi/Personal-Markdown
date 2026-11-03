import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Clock3, Eye, FileText, PenLine, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { categories, useNotesStore } from '../features/notes'
import type { Note } from '../features/notes'

type LayoutContext = { query: string; setQuery: (value: string) => void; createNote: () => void }
type ViewMode = 'write' | 'preview' | 'split'

const formatSaved = (date: string) =>
  `Edited ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date))}`

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setQuery } = useOutletContext<LayoutContext>()
  const note = useNotesStore((state) => state.notes.find((item) => item.id === id))
  const updateNote = useNotesStore((state) => state.updateNote)
  const deleteNote = useNotesStore((state) => state.deleteNote)
  const [tagInput, setTagInput] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [showDelete, setShowDelete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const markdownComponents = useMemo(() => ({ a: ({ ...props }) => <a {...props} target="_blank" rel="noreferrer" /> }), [])

  useEffect(() => {
    setQuery('')
  }, [setQuery])

  useEffect(() => {
    if (!note) return
    setIsSaving(true)
    const timer = window.setTimeout(() => setIsSaving(false), 450)
    return () => window.clearTimeout(timer)
  }, [note?.updatedAt])

  if (!note) {
    return (
      <div className="not-found-state">
        <div className="empty-illustration"><FileText size={24} /></div>
        <h1>This note wandered off.</h1>
        <p>It may have been deleted, or the link might be out of date.</p>
        <Link to="/" className="create-note-button"><ArrowLeft size={16} /> Back to your notes</Link>
      </div>
    )
  }

  const setField = (field: keyof Pick<Note, 'title' | 'content' | 'category'>, value: string) =>
    updateNote(note.id, { [field]: value })

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '')
    if (!tag || note.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setTagInput('')
      return
    }
    updateNote(note.id, { tags: [...note.tags, tag] })
    setTagInput('')
  }

  const removeTag = (tag: string) =>
    updateNote(note.id, { tags: note.tags.filter((item) => item !== tag) })

  const deleteCurrentNote = () => {
    deleteNote(note.id)
    navigate('/')
  }

  const editorVisible = viewMode !== 'preview'
  const previewVisible = viewMode !== 'write'

  return (
    <section className="editor-page">
      <div className="editor-toolbar">
        <Link to="/" className="back-link"><ArrowLeft size={16} /><span>All notes</span></Link>
        <div className="editor-toolbar-right">
          <span className={`save-status ${isSaving ? 'saving' : ''}`} role="status" aria-live="polite">
            <span className="save-indicator">{isSaving ? <span className="saving-dot" /> : <Check size={14} />}</span>
            {isSaving ? 'Saving' : 'Saved'}
          </span>
          <div className="view-switch" aria-label="Editor view">
            <button className={viewMode === 'write' ? 'selected' : ''} onClick={() => setViewMode('write')} title="Write only"><PenLine size={15} /><span>Write</span></button>
            <button className={viewMode === 'split' ? 'selected' : ''} onClick={() => setViewMode('split')} title="Split view"><span className="split-icon"><i /><i /></span><span>Split</span></button>
            <button className={viewMode === 'preview' ? 'selected' : ''} onClick={() => setViewMode('preview')} title="Preview only"><Eye size={15} /><span>Preview</span></button>
          </div>
          <button className="icon-button delete-note-button" onClick={() => setShowDelete(true)} aria-label="Delete note" title="Delete note"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-meta">
          <div className="editor-category-row">
            <label className={`category-pill category-${note.category.toLowerCase()}`}>
              <select value={note.category} onChange={(event) => setField('category', event.target.value)}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <span className="meta-divider">·</span>
            <span className="edited-time"><Clock3 size={13} />{formatSaved(note.updatedAt)}</span>
          </div>
          <input
            className="note-title-input"
            value={note.title}
            onChange={(event) => setField('title', event.target.value)}
            placeholder="Untitled note"
            aria-label="Note title"
          />
          <div className="tag-edit-row">
            <div className="editable-tags">
              {note.tags.map((tag) => (
                <button className="editable-tag" key={tag} onClick={() => removeTag(tag)} title={`Remove ${tag}`}>
                  #{tag}<span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            <input
              className="tag-input"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ',') {
                  event.preventDefault()
                  addTag()
                }
              }}
              onBlur={addTag}
              placeholder={note.tags.length ? 'Add tag...' : '+ Add a tag'}
              aria-label="Add tag"
            />
          </div>
        </div>

        <div className={`writing-area ${viewMode}`}>
          {editorVisible && (
            <div className="writing-pane">
              <div className="pane-label"><PenLine size={13} /> MARKDOWN</div>
              <textarea
                className="markdown-input"
                value={note.content}
                onChange={(event) => setField('content', event.target.value)}
                placeholder={'Start writing something...\n\nMarkdown is supported.'}
                aria-label="Note content in Markdown"
                spellCheck
              />
              <div className="markdown-hint">Markdown supported <span>·</span> Changes save automatically</div>
            </div>
          )}
          {previewVisible && (
            <div className="preview-pane">
              <div className="pane-label"><Eye size={14} /> PREVIEW</div>
              <article className="markdown-preview">
                {note.content.trim()
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{note.content}</ReactMarkdown>
                  : <p className="preview-placeholder">Your note preview will appear here...</p>}
              </article>
            </div>
          )}
        </div>
      </div>

      {showDelete && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowDelete(false)
        }}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="dialog-icon"><Trash2 size={19} /></div>
            <h2 id="delete-title">Delete this note?</h2>
            <p>“{note.title || 'Untitled note'}” will be removed from your notes. This can’t be undone.</p>
            <div className="dialog-actions">
              <button className="secondary-button" onClick={() => setShowDelete(false)} data-keyboard-dismiss>Keep note</button>
              <button className="danger-button" onClick={deleteCurrentNote}>Delete note</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
