import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import { Card } from '../components/Card'
import SystemStatus from '../components/SystemStatus'
import { Sparkles, Calendar, BookOpen, TrendingUp, Clock, Zap } from 'lucide-react'
import { isAuthenticated } from '../lib/auth'

export default function Home() {
  const authed = isAuthenticated()
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
        delayChildren: prefersReducedMotion ? 0 : 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.4,
        ease: 'easeOut',
      },
    },
  }

  const heroVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.5,
        ease: 'easeOut',
      },
    },
  }

  const features = [
    {
      icon: Sparkles,
      title: 'Auto Plans',
      description: 'AI-powered learning plans tailored to your goals and current skills.',
    },
    {
      icon: Calendar,
      title: 'Track Weeks',
      description: 'Organize your learning journey week by week with detailed progress tracking.',
    },
    {
      icon: BookOpen,
      title: 'Curated Resources',
      description: 'Access hand-picked resources and links to accelerate your learning.',
    },
  ]

  const stats = [
    {
      icon: TrendingUp,
      label: 'Plans generated',
      value: '1.2k+',
      ariaLabel: 'Plans generated: 1.2k plus',
    },
    {
      icon: Clock,
      label: 'Avg plan length',
      value: '12 weeks',
      ariaLabel: 'Average plan length: 12 weeks',
    },
    {
      icon: Zap,
      label: 'Last updated',
      value: 'today',
      ariaLabel: 'Last updated: today',
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative -my-8 pt-28 md:pt-36 pb-10">
        <div className="text-center space-y-6">
          <motion.h1
            variants={heroVariants}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
          >
            Level up faster with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600">
              SkillSetu
            </span>
          </motion.h1>
          <motion.p
            variants={heroVariants}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
            className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl"
          >
            Generate personalized learning plans with AI, track your progress, and hit your career goals—without the fluff.
          </motion.p>
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
            className="flex items-center justify-center gap-3 flex-wrap pt-4"
          >
            {authed ? (
              <>
                <Link to="/plans">
                  <Button size="lg" className="focus-ring">
                    Go to Plans
                  </Button>
                </Link>
                <Link to="/plans/auto">
                  <Button variant="secondary" size="lg" className="focus-ring">
                    New Auto Plan
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/plans">
                  <Button size="lg" className="focus-ring">
                    Go to Plans
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" className="focus-ring">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="ghost" size="lg" className="focus-ring">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* System Status (only when logged in) */}
      {authed && (
        <section className="relative mt-10 md:mt-14">
          <SystemStatus />
        </section>
      )}

      {/* Features Section */}
      <section className="relative mt-10 md:mt-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Card className="h-full text-center transition-all duration-300 hover:shadow-2xl hover:ring-1 hover:ring-brand-500/40 focus-within:ring-2 focus-within:ring-brand-500">
                  <div className="flex flex-col items-center">
                    <Icon
                      className="w-10 h-10 md:w-12 md:h-12 text-brand-400 mb-4"
                      aria-hidden="true"
                    />
                    <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Impact Strip */}
      <section className="relative mt-10 md:mt-16 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div key={i} variants={itemVariants}>
                <Card
                  className="text-center py-6 transition-all duration-300 hover:shadow-xl hover:ring-1 hover:ring-brand-500/30 focus-within:ring-2 focus-within:ring-brand-500"
                  aria-label={stat.ariaLabel}
                  tabIndex={0}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Icon
                      className="w-8 h-8 text-brand-400"
                      aria-hidden="true"
                    />
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-white/70">
                      {stat.label}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </section>
    </main>
  )
}
