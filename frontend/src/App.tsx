import { Suspense, lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Protected from './routes/Protected'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { SkeletonCard } from './components/Skeleton'

// Code-split pages
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Plans = lazy(() => import('./pages/Plans'))
const AutoPlan = lazy(() => import('./pages/AutoPlan'))
const PlanDetail = lazy(() => import('./pages/PlanDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageTransition({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function SuspenseFallback() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <ErrorBoundary>
      <div className="text-white min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        <Toast />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <Suspense fallback={<SuspenseFallback />}>
                    <PageTransition>
                      <Home />
                    </PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="/login"
                element={
                  <Suspense fallback={<SuspenseFallback />}>
                    <PageTransition>
                      <Login />
                    </PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="/register"
                element={
                  <Suspense fallback={<SuspenseFallback />}>
                    <PageTransition>
                      <Register />
                    </PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="/plans"
                element={
                  <Protected>
                    <Suspense fallback={<SuspenseFallback />}>
                      <PageTransition>
                        <Plans />
                      </PageTransition>
                    </Suspense>
                  </Protected>
                }
              />
              <Route
                path="/plans/auto"
                element={
                  <Protected>
                    <Suspense fallback={<SuspenseFallback />}>
                      <PageTransition>
                        <AutoPlan />
                      </PageTransition>
                    </Suspense>
                  </Protected>
                }
              />
              <Route
                path="/plans/:id"
                element={
                  <Protected>
                    <Suspense fallback={<SuspenseFallback />}>
                      <PageTransition>
                        <PlanDetail />
                      </PageTransition>
                    </Suspense>
                  </Protected>
                }
              />
              <Route
                path="/404"
                element={
                  <Suspense fallback={<SuspenseFallback />}>
                    <PageTransition>
                      <NotFound />
                    </PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <Suspense fallback={<SuspenseFallback />}>
                    <PageTransition>
                      <NotFound />
                    </PageTransition>
                  </Suspense>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  )
}