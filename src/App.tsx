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
      const isTextEntry = target?.matches('input, textarea, select, [contenteditable="true"]') ?? false
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
      const primaryModifier = isMac ? event.metaKey : event.ctrlKey
      const dialogOpen = Boolean(document.querySelector('[role="dialog"]'))

      if (event.key === 'Escape') {
        const dismissButton = document.querySelector<HTMLElement>('[data-keyboard-dismiss]')
        if (dismissButton) {
          event.preventDefault()
          dismissButton.click()
          return
        }
        if (!isTextEntry && !dialogOpen && window.location.pathname.startsWith('/notes/')) {
          event.preventDefault()
          navigate('/')
        }
        return
      }

      if (event.repeat || dialogOpen) return

      const key = event.key.toLowerCase()
      if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && key === 'n' && !isTextEntry) {
        event.preventDefault()
        const id = addNote()
        navigate(`/notes/${id}`)
        return
      }
      const isSearchInput = target?.matches('.search-box input') ?? false
      if (primaryModifier && !event.altKey && !event.shiftKey && key === 'k' && (!isTextEntry || isSearchInput)) {
        event.preventDefault()
        const search = document.querySelector<HTMLInputElement>('.search-box input')
        search?.focus()
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
