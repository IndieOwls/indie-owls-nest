import { Navigate, Outlet } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      displayName
    }
  }
`

export function ProtectedRoute() {
  const { data, loading, error } = useQuery(ME_QUERY)

  if (loading) return <p>Loading...</p>
  if (error || !data?.me) return <Navigate to="/login" replace />

  return <Outlet />
}
