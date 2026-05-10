import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import { AUTH_API, csrfHeaders } from '../api'

const Wrapper = styled.div`
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; padding: 2rem;
`
const Card = styled.div`
  width: 100%; max-width: 400px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid #e0e0e0; border-radius: 8px; padding: 2rem;
`
const Title = styled.h1`
  margin: 0 0 1.5rem; font-size: 1.5rem; text-align: center;
  color: ${({ theme }) => theme.colors.text};
`
const Input = styled.input`
  width: 100%; padding: 0.75rem; margin-bottom: 1rem;
  border: 1px solid #d0d0d0; border-radius: 4px; font-size: 1rem;
  box-sizing: border-box;
`
const Button = styled.button`
  width: 100%; padding: 0.75rem; font-size: 1rem; font-weight: 600;
  background: ${({ theme }) => theme.colors.primary}; color: #fff;
  border: none; border-radius: 4px; cursor: pointer;
  &:disabled { opacity: 0.6; }
`
const Error = styled.p`color: #e74c3c; text-align: center; margin: 0.5rem 0;`
const Footer = styled.p`text-align: center; margin: 1rem 0 0;`

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      })
      if (!res.ok) { const b = await res.json(); setError(b.message ?? 'Registration failed'); return }
      navigate('/')
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <Wrapper>
      <Card>
        <Title>Create Account</Title>
        <form onSubmit={handleSubmit}>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          {error && <Error role="alert">{error}</Error>}
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
        </form>
        <Footer>Have an account? <Link to="/login">Sign in</Link></Footer>
      </Card>
    </Wrapper>
  )
}
