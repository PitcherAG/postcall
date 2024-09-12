import { type FC } from 'react'

import { PostcallForm } from '@/components/PostcallForm'
import { Toaster } from '@/components/ui/toaster'
import { PitcherProvider } from '@/components/providers/PitcherProvider'
import './App.css'
import './assets/fa/css/fontawesome.min.css'
import './assets/fa/css/regular.min.css'
import './assets/fa/css/solid.min.css'
import './assets/fa/css/light.min.css'
import './assets/fa/css/brands.min.css'
import './assets/fa/css/custom-icons.min.css'

const App: FC = () => (
  <div className="app h-full pl-1 pr-6">
    <PitcherProvider>
      <PostcallForm />
      <Toaster />
    </PitcherProvider>
  </div>
)

export default App
