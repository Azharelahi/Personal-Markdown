import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotesStore } from '../store/notes'

export function useNotesShortcuts() {
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
        document.querySelector<HTMLInputElement>('.search-box input')?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [addNote, navigate])
}
