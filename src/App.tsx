import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import EditorPage from './pages/EditorPage'
import NotesPage from './pages/NotesPage'
import { useNotesStore } from './store/notes'

export default function App() {
  const navigate = useNavigate()
  const addNote = useNotesStore((state) => state.addNote)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null
      const isTyping = target?.matches('input, textarea, [contenteditable="true"]')
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        const id = addNote()
        navigate(`/notes/${id}`)
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const search = document.querySelector<HTMLInputElement>('.search-box input')
        search?.focus()
      }
      if (event.key === 'Escape' && !isTyping && !document.querySelector('[role="dialog"]') && window.location.pathname.startsWith('/notes/')) {
        navigate('/')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [addNote, navigate])

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<NotesPage />} />
        <Route path="notes/new" element={<NewNoteRedirect />} />
        <Route path="notes/:id" element={<EditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function NewNoteRedirect() {
  const addNote = useNotesStore((state) => state.addNote)
  const navigate = useNavigate()
  const created = useRef(false)

  useEffect(() => {
    if (created.current) return
    created.current = true
    const id = addNote()
    navigate(`/notes/${id}`, { replace: true })
  }, [addNote, navigate])

  return null
}
