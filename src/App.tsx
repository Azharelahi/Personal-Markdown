import { useNotesShortcuts } from './features/notes'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  useNotesShortcuts()
  return <AppRoutes />
}
