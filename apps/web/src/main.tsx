import 'normalize.css'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Providers } from './app/providers'
import { App } from './app/App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
