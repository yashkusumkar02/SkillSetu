import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './Card'
import Button from './Button'
import Input from './Input'
import { getToken } from '../lib/auth'
import { useToast } from '../hooks/useToast'

type AuthStatus = 'unknown' | 'checking' | 'authorized' | 'failed'
type OllamaStatus = 'unknown' | 'checking' | 'ok' | 'unavailable'

const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// Helper: fetch with token and timeout
async function requestWithToken(
  method: 'GET' | 'POST' | 'DELETE',
  url: string,
  token: string,
  body?: any,
  timeoutMs = 60000
) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    }
    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(`${base}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    clearTimeout(t)
    return res
  } catch (err) {
    clearTimeout(t)
    throw err
  }
}

export default function SystemStatus() {
  const [storedToken, setStoredToken] = useState<string | null>(null)
  const [pastedToken, setPastedToken] = useState('')
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unknown')
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('unknown')
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    // Read token from localStorage
    const token = getToken()
    setStoredToken(token)
  }, [])

  // Refresh token display when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredToken(getToken())
    }
    window.addEventListener('storage', handleStorageChange)
    // Also check on focus (in case token changed in another tab)
    window.addEventListener('focus', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  const copyToken = () => {
    if (storedToken) {
      navigator.clipboard.writeText(storedToken)
      setCopied(true)
      showToast('Token copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const maskToken = (token: string | null): string => {
    if (!token) return 'No token'
    if (token.length <= 10) return '•'.repeat(token.length)
    return `…${token.slice(-10)}`
  }

  const verifyAuthorization = async () => {
    const effectiveToken = pastedToken.trim() || storedToken
    if (!effectiveToken) {
      showToast('No token found.', 'error')
      return
    }

    setAuthStatus('checking')
    try {
      const res = await requestWithToken('GET', '/users/me', effectiveToken)
      if (res.ok) {
        setAuthStatus('authorized')
        showToast('Authorization verified successfully', 'success')
      } else {
        setAuthStatus('failed')
        const statusText = res.statusText || `Status ${res.status}`
        showToast(`Authorization failed: ${statusText}`, 'error')
      }
    } catch (err: any) {
      setAuthStatus('failed')
      const message = err.name === 'AbortError' ? 'Request timeout' : 'Network error'
      showToast(`Authorization check failed: ${message}`, 'error')
    }
  }

  const checkOllama = async () => {
    const effectiveToken = pastedToken.trim() || storedToken
    if (!effectiveToken) {
      showToast('No token found.', 'error')
      return
    }

    setOllamaStatus('checking')
    let planId: string | null = null

    try {
      // POST /plans/auto with healthcheck body
      const createRes = await requestWithToken(
        'POST',
        '/plans/auto',
        effectiveToken,
        {
          goal: 'HEALTHCHECK',
          current_skills: [],
          duration_weeks: 2,
        },
        120000 // 120s timeout
      )

      if (!createRes.ok) {
        if (createRes.status === 502) {
          setOllamaStatus('unavailable')
          showToast(
            'AI generator unavailable. Check if Ollama is running and reachable from backend.',
            'error'
          )
        } else {
          setOllamaStatus('unavailable')
          const statusText = createRes.statusText || `Status ${createRes.status}`
          showToast(`Ollama check failed: ${statusText}`, 'error')
        }
        return
      }

      const createData = await createRes.json()
      planId = createData.plan_id

      if (!planId) {
        setOllamaStatus('unavailable')
        showToast('Ollama check failed: No plan_id in response', 'error')
        return
      }

      // Clean up: DELETE the test plan (best effort)
      try {
        await requestWithToken('DELETE', `/plans/${planId}`, effectiveToken, undefined, 10000)
      } catch (deleteErr) {
        // Ignore delete errors, but log for debugging
        console.warn('Failed to delete test plan:', deleteErr)
      }

      setOllamaStatus('ok')
      showToast('Ollama check passed', 'success')
    } catch (err: any) {
      setOllamaStatus('unavailable')
      if (err.name === 'AbortError') {
        showToast(
          'AI generator unavailable. Check if Ollama is running and reachable from backend.',
          'error'
        )
      } else if (err.message?.includes('502') || err.message?.includes('Bad Gateway')) {
        showToast(
          'AI generator unavailable. Check if Ollama is running and reachable from backend.',
          'error'
        )
      } else {
        showToast(
          'AI generator unavailable. Check if Ollama is running and reachable from backend.',
          'error'
        )
      }
    }
  }

  const getStatusPillClass = (status: AuthStatus | OllamaStatus): string => {
    switch (status) {
      case 'unknown':
        return 'bg-white/10 text-white/70'
      case 'checking':
        return 'bg-sky-600/20 text-sky-300'
      case 'authorized':
      case 'ok':
        return 'bg-emerald-600/20 text-emerald-300'
      case 'failed':
      case 'unavailable':
        return 'bg-rose-600/20 text-rose-300'
      default:
        return 'bg-white/10 text-white/70'
    }
  }

  const getStatusLabel = (status: AuthStatus | OllamaStatus): string => {
    switch (status) {
      case 'unknown':
        return 'Unknown'
      case 'checking':
        return 'Checking'
      case 'authorized':
        return 'Authorized'
      case 'ok':
        return 'Ollama OK'
      case 'failed':
        return 'Failed'
      case 'unavailable':
        return 'Unavailable'
      default:
        return 'Unknown'
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.3,
        ease: 'easeOut',
      },
    },
  }

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authorization Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Authorization</h4>
              <span className={`status-pill ${getStatusPillClass(authStatus)}`}>
                {getStatusLabel(authStatus)}
              </span>
            </div>

            {/* Masked Token Display */}
            {storedToken && (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-white/80 truncate">
                  {maskToken(storedToken)}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyToken}
                  className="shrink-0"
                  aria-label="Copy token"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Token Input */}
            <Input
              type="text"
              placeholder="Paste token to test (optional)"
              value={pastedToken}
              onChange={(e) => setPastedToken(e.target.value)}
              className="font-mono text-sm"
              aria-label="Authorization token input"
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={verifyAuthorization}
              disabled={authStatus === 'checking'}
              loading={authStatus === 'checking'}
              className="w-full sm:w-auto"
            >
              Verify Authorization
            </Button>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Ollama Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Generator (Ollama)</h4>
              <span className={`status-pill ${getStatusPillClass(ollamaStatus)}`}>
                {getStatusLabel(ollamaStatus)}
              </span>
            </div>

            <p className="text-xs text-white/60">
              Creates a test plan and deletes it to verify Ollama connectivity.
            </p>

            <Button
              variant="secondary"
              size="sm"
              onClick={checkOllama}
              disabled={ollamaStatus === 'checking'}
              loading={ollamaStatus === 'checking'}
              className="w-full sm:w-auto"
            >
              Check Ollama
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

