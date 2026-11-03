import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { NotesLayout, useNotesStore } from '../features/notes'
import EditorPage from '../pages/EditorPage'
import NotesPage from '../pages/NotesPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<NotesLayout />}>
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
