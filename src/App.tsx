import { type FC } from 'react'

import './App.css'
import { PostcallForm } from '@/components/PostcallForm'
import { PitcherProvider } from '@/components/PitcherProvider'

const App: FC = () => (
  <div className="app h-full pl-1 pr-6">
    <PitcherProvider>
      <PostcallForm />
    </PitcherProvider>
  </div>
)

export default App
