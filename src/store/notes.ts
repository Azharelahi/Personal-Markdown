import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Note } from '../types'

type NoteInput = Pick<Note, 'title' | 'content' | 'category' | 'tags'>

type NotesState = {
  notes: Note[]
  addNote: (input?: Partial<NoteInput>) => string
  updateNote: (id: string, updates: Partial<NoteInput>) => void
  deleteNote: (id: string) => void
  getNote: (id: string) => Note | undefined
}

const starterNotes: Note[] = [
  {
    id: 'welcome-note',
    title: 'A little space to think',
    content:
      '# Welcome to Papertrail\n\nA calm place for everything on your mind. Capture a thought, shape an idea, or keep a note for later.\n\n## Make it yours\n\n- Create notes with **Markdown** support\n- Organize them with categories and tags\n- Find anything with a quick search\n\n> Your notes stay right here in your browser.',
    category: 'Personal',
    tags: ['getting started', 'ideas'],
    createdAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-10-28T10:00:00.000Z',
  },
  {
    id: 'weekend-list',
    title: 'Slow weekend plans',
    content:
      'A few things I want to make time for this weekend.\n\n- [ ] Pick up fresh flowers\n- [ ] Take the long trail by the water\n- [ ] Make that lemon pasta\n- [x] Put my phone away for a bit\n\nNo rush. Just room to breathe.',
    category: 'Journal',
    tags: ['weekend', 'life'],
    createdAt: '2026-10-27T15:40:00.000Z',
    updatedAt: '2026-10-29T08:12:00.000Z',
  },
  {
    id: 'product-thoughts',
    title: 'A few product thoughts',
    content:
      '## The small details matter\n\nA good experience should feel **obvious**, not effortless by accident.\n\n1. Start with the one thing people came to do\n2. Keep the interface out of their way\n3. Make the next step feel natural\n\n> Good design is as little design as possible.',
    category: 'Work',
    tags: ['product', 'design'],
    createdAt: '2026-10-25T09:30:00.000Z',
    updatedAt: '2026-10-28T11:05:00.000Z',
  },
  {
    id: 'small-ideas',
    title: 'Small ideas worth keeping',
    content:
      'A collection of tiny things that might become something later.\n\n- A reading list that grows with your mood\n- A map of neighborhood coffee shops\n- A Sunday email to future me',
    category: 'Ideas',
    tags: ['someday', 'inspiration'],
    createdAt: '2026-10-22T13:15:00.000Z',
    updatedAt: '2026-10-26T17:20:00.000Z',
  },
]

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: starterNotes,
      addNote: (input = {}) => {
        const now = new Date().toISOString()
        const id = createId()
        const note: Note = {
          id,
          title: input.title ?? '',
          content: input.content ?? '',
          category: input.category ?? 'Personal',
          tags: input.tags ?? [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ notes: [note, ...state.notes] }))
        return id
      },
      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note,
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
      getNote: (id) => get().notes.find((note) => note.id === id),
    }),
    {
      name: 'papertrail-notes',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notes: state.notes }),
    },
  ),
)
