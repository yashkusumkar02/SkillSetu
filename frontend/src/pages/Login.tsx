import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import api from '../lib/axios'
import { setToken } from '../lib/auth'
import { useToast } from '../hooks/useToast'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password: string): boolean {
  return password.length >= 6
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from || '/plans'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)
    try {
      // POST /auth/auth/login
      const res = await api.post('/auth/auth/login', { email, password })
      // Store JWT from res.data.access_token
      // Smoke test: After login, localStorage['skillsetu_token'] must exist
      setToken(res.data.access_token)
      showToast('Logged in successfully', 'success')
      // Navigate to /plans after storing token
      navigate('/plans', { replace: true })
    } catch (e: any) {
      const message = e?.response?.data?.detail || 'Login failed'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <form onSubmit={submit}>
            <CardContent className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: '' }))
                  }
                }}
                placeholder="you@example.com"
                error={errors.email}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: '' }))
                  }
                }}
                placeholder="••••••••"
                error={errors.password}
                required
                autoComplete="current-password"
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" disabled={loading} loading={loading} className="w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
              <div className="text-sm text-white/70 text-center">
                No account?{' '}
                <Link to="/register" className="text-brand-400 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded">
                  Register
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}