import type { DataProvider } from '@refinedev/core'
import { csrfHeaders } from './csrf'

const TAG_V1 = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TAG_V1) ?? 'YYYY-MM-DD'
const API_PREFIX = `api/${TAG_V1}`
const API_URL = `/${API_PREFIX}/graphql`

async function gql<T = any>(
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
    credentials: 'include',
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data as T
}

// Hard-coded resource mapping so we don't guess GraphQL argument names.
// Add resources here as the admin client grows.
const RESOURCES: Record<
  string,
  {
    singular: string
    idType: string
    fields: string[]
    createArg?: string
    updateArg?: string
    deleteArg?: string
  }
> = {
  users: {
    singular: 'user',
    idType: 'ID',
    fields: ['id', 'username', 'email', 'displayName', 'role', 'tier', 'createdAt', 'lastActiveAt'],
  },
  featureFlags: {
    singular: 'featureFlag',
    idType: 'Int',
    fields: ['id', 'name', 'description', 'enabled', 'allowedRoles', 'createdAt', 'updatedAt'],
    createArg: 'createFeatureFlagInput',
    updateArg: 'updateFeatureFlagInput',
    deleteArg: 'id',
  },
  appNewsArticles: {
    singular: 'appNewsArticle',
    idType: 'Int',
    fields: ['id', 'title', 'content', 'isPublished', 'authorId', 'sourceUrl', 'publishedAt', 'createdAt', 'updatedAt'],
    createArg: 'createAppNewsArticleInput',
    updateArg: 'updateAppNewsArticleInput',
    deleteArg: 'id',
  },
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function cfg(resource: string) {
  const c = RESOURCES[resource]
  if (!c) throw new Error(`Unknown resource: ${resource}`)
  return c
}

export const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  getList: async ({ resource }) => {
    const c = cfg(resource)
    const query = `query { ${resource} { ${c.fields.join(' ')} } }`
    const data = await gql<Record<string, any>>(query)
    const items = data[resource] ?? []
    return { data: items, total: items.length }
  },

  getOne: async ({ resource, id }) => {
    const c = cfg(resource)
    const query = `query($id: ${c.idType}!) { ${c.singular}(id: $id) { ${c.fields.join(' ')} } }`
    const data = await gql<Record<string, any>>(query, { id })
    return { data: data[c.singular] }
  },

  create: async ({ resource, variables }) => {
    const c = cfg(resource)
    const arg = c.createArg ?? `${c.singular}Input`
    const mutationName = `create${capitalize(c.singular)}`
    const inputType = `Create${capitalize(c.singular)}Input`
    const query = `mutation($input: ${inputType}!) { ${mutationName}(${arg}: $input) { ${c.fields.join(' ')} } }`
    const data = await gql<Record<string, any>>(query, { input: variables })
    return { data: data[mutationName] }
  },

  update: async ({ resource, id, variables }) => {
    const c = cfg(resource)
    const arg = c.updateArg ?? `update${capitalize(c.singular)}Input`
    const mutationName = `update${capitalize(c.singular)}`
    const inputType = `Update${capitalize(c.singular)}Input`
    const query = `mutation($input: ${inputType}!) { ${mutationName}(${arg}: $input) { ${c.fields.join(' ')} } }`
    const data = await gql<Record<string, any>>(query, { input: { id, ...variables } })
    return { data: data[mutationName] }
  },

  deleteOne: async ({ resource, id }) => {
    const c = cfg(resource)
    const arg = c.deleteArg ?? 'id'
    const mutationName = `remove${capitalize(c.singular)}`
    const query = `mutation($id: ${c.idType}!) { ${mutationName}(${arg}: $id) { ${c.fields.join(' ')} } }`
    const data = await gql<Record<string, any>>(query, { id })
    return { data: data[mutationName] }
  },
}
