import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { isAuthenticated, clearToken } from '../lib/auth'
import { Rocket, LogOut } from 'lucide-react'
import Button from './Button'

export default function Navbar() {
  const authed = isAuthenticated()
  const loc = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') {
      return loc.pathname === '/'
    }
    return loc.pathname.startsWith(path)
  }

  return (
    <motion.header
      className={`sticky top-0 z-20 backdrop-blur-md border-b transition-all ${
        scrolled ? 'bg-black/60 border-white/20 py-2' : 'bg-black/40 border-white/10 py-3'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Rocket className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-semibold tracking-wide">SkillSetu</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/plans"
            className={`px-4 py-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              isActive('/plans')
                ? 'bg-brand-600 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            aria-current={isActive('/plans') ? 'page' : undefined}
          >
            Plans
          </Link>
          {!authed ? (
            <>
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                clearToken()
                navigate('/login')
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </nav>
      </div>
    </motion.header>
  )
}