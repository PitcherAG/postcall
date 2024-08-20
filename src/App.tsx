import { type FC } from 'react'

import { PostcallForm } from '@/components/PostcallForm'
import { Toaster } from '@/components/ui/toaster'
import { PitcherProvider } from '@/components/providers/PitcherProvider'
import './App.css'

const App: FC = () => (
  <div className="app h-full pl-1 pr-6">
    <PitcherProvider>
      <PostcallForm />
      <Toaster />
    </PitcherProvider>
  </div>
)

export default App
