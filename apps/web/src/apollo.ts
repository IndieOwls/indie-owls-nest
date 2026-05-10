import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { csrfHeaders } from './api'

const TAG_V1 = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TAG_V1) ?? 'YYYY-MM-DD'
const API_PREFIX = `api/${TAG_V1}`

const httpLink = createHttpLink({
  uri: `/${API_PREFIX}/graphql`,
  credentials: 'include',
})

const csrfLink = setContext(() => ({ headers: csrfHeaders() }))

export const apolloClient = new ApolloClient({
  link: csrfLink.concat(httpLink),
  cache: new InMemoryCache(),
})
