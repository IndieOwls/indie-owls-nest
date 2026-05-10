import { useNavigate } from 'react-router-dom'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components'
import { AUTH_API, csrfHeaders } from '../api'

const Layout = styled.div`
  max-width: 800px; margin: 0 auto; padding: 2rem;
`
const Header = styled.header`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem; padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`
const Title = styled.h1`
  margin: 0; font-size: 1.5rem; color: ${({ theme }) => theme.colors.text};
`
const LogoutBtn = styled.button`
  padding: 0.5rem 1rem; font-size: 0.875rem;
  background: transparent; color: ${({ theme }) => theme.colors.text};
  border: 1px solid #d0d0d0; border-radius: 4px; cursor: pointer;
`
const Content = styled.main`
  color: ${({ theme }) => theme.colors.text};
`

export function DashboardPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    await fetch(`${AUTH_API}/logout`, { method: 'POST', credentials: 'include', headers: { ...csrfHeaders() } })
    navigate('/login')
  }

  return (
    <Layout>
      <Header>
        <Title><Trans>Dashboard</Trans></Title>
        <LogoutBtn onClick={handleLogout}><Trans>Sign Out</Trans></LogoutBtn>
      </Header>
      <Content>
        <p><Trans>Welcome to your dashboard.</Trans></p>
      </Content>
    </Layout>
  )
}
