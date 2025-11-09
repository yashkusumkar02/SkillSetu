import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import api from '../lib/axios'
import { useToast } from '../hooks/useToast'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password: string): boolean {
  return password.length >= 6
}

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showToast } = useToast()
  const navigate = useNavigate()

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
      // POST /auth/auth/register
      // Extract name from email (part before @) for backend requirement
      const name = email.split('@')[0] || email
      await api.post('/auth/auth/register', { email, password, name })
      showToast('Registered successfully, please log in', 'success')
      navigate('/login')
    } catch (e: any) {
      const message = e?.response?.data?.detail || 'Registration failed'
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
            <CardTitle>Create account</CardTitle>
            <CardDescription>Sign up to start creating your learning plans</CardDescription>
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
                description="Password must be at least 6 characters"
                error={errors.password}
                required
                autoComplete="new-password"
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" disabled={loading} loading={loading} className="w-full">
                {loading ? 'Creating…' : 'Create account'}
              </Button>
              <div className="text-sm text-white/70 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}