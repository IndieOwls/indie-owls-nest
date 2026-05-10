import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'
import { apolloClient } from '../apollo'
import { store } from '../store'
import { ThemeModeProvider } from './theme/ThemeModeProvider'
import { I18nAppProvider } from './i18n'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <ThemeModeProvider>
            <I18nAppProvider>{children}</I18nAppProvider>
          </ThemeModeProvider>
        </BrowserRouter>
      </ApolloProvider>
    </Provider>
  )
}
