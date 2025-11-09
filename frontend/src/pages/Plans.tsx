import { useEffect, useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import api from '../lib/axios'
import { SkeletonCard } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Input from '../components/Input'
import Modal from '../components/Modal'
import StatsBar from '../components/StatsBar'
import { useToast } from '../hooks/useToast'
import { timeAgo } from '../utils/date'

type Plan = {
  id: string
  target_role: string
  duration_weeks: number
  status: string
  summary: string
  created_at: string
}

type FilterType = 'all' | 'active' | 'completed' | 'auto'

export default function Plans() {
  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { showToast } = useToast()
  const prefersReducedMotion = useReducedMotion()

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans/')
      setPlans(res.data)
    } catch (e: any) {
      showToast(e?.response?.data?.detail || 'Failed to load plans', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const filteredPlans = useMemo(() => {
    if (!plans) return []

    let filtered = plans

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (plan) =>
          plan.target_role.toLowerCase().includes(query) ||
          plan.summary.toLowerCase().includes(query) ||
          plan.status.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'active') {
        filtered = filtered.filter((plan) => plan.status.toLowerCase() === 'active')
      } else if (activeFilter === 'completed') {
        filtered = filtered.filter((plan) => plan.status.toLowerCase() === 'completed')
      } else if (activeFilter === 'auto') {
        // Assuming auto plans might have a specific indicator - for now, filter by summary containing "auto" or similar
        // Since we don't have an explicit "auto" field, we'll check if the summary mentions it
        filtered = filtered.filter((plan) =>
          plan.summary.toLowerCase().includes('ai') || plan.summary.toLowerCase().includes('auto')
        )
      }
    }

    return filtered
  }, [plans, searchQuery, activeFilter])

  // Calculate stats from filtered plans (or all plans for stats)
  const stats = useMemo(() => {
    if (!plans || plans.length === 0) {
      return {
        total: 0,
        avgDuration: 0,
        lastCreated: null as string | null,
      }
    }

    const total = plans.length
    const avgDuration =
      plans.reduce((sum, plan) => sum + plan.duration_weeks, 0) / total || 0
    const sortedPlans = [...plans].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const lastCreated = sortedPlans.length > 0 ? timeAgo(sortedPlans[0].created_at) : null

    return {
      total,
      avgDuration: Math.round(avgDuration * 10) / 10,
      lastCreated,
    }
  }, [plans])

  const onDelete = async (id: string) => {
    try {
      await api.delete(`/plans/${id}`)
      showToast('Plan deleted', 'success')
      setPlans((prev) => (prev ? prev.filter((p) => p.id !== id) : prev))
    } catch (e: any) {
      showToast(e?.response?.data?.detail || 'Delete failed', 'error')
    } finally {
      setConfirm({ open: false })
    }
  }

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'auto', label: 'Auto' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.3,
        ease: 'easeOut',
      },
    },
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-10 md:mt-14 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold">Your Plans</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="max-w-7xl mx-auto mt-10 md:mt-14">
        <EmptyState />
      </div>
    )
  }

  const planToDelete = plans.find((p) => p.id === confirm.id)

  return (
    <div className="max-w-7xl mx-auto mt-10 md:mt-14 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">Your Plans</h2>
        <Link to="/plans/auto">
          <Button className="focus-ring">New Auto Plan</Button>
        </Link>
      </div>

      {/* Stats Bar */}
      <StatsBar
        totalPlans={stats.total}
        avgDuration={stats.avgDuration}
        lastCreated={stats.lastCreated}
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            aria-label="Search plans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                activeFilter === filter.id
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              aria-pressed={activeFilter === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">No plans found matching your criteria.</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              setSearchQuery('')
              setActiveFilter('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredPlans.map((plan) => (
            <motion.div key={plan.id} variants={itemVariants}>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:ring-1 hover:ring-brand-500/40">
                  <div className="flex-1">
                    <div className="text-sm text-white/60 mb-1">{plan.target_role}</div>
                    <h3 className="text-lg font-semibold mb-2">{plan.duration_weeks} weeks plan</h3>
                    <p className="text-white/70 line-clamp-2 mb-3 text-sm">{plan.summary}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="status" className="capitalize">
                        {plan.status}
                      </Badge>
                      <span className="text-xs text-white/50">Created {timeAgo(plan.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                    <Link to={`/plans/${plan.id}`}>
                      <Button variant="secondary" className="w-full focus-ring">
                        View
                      </Button>
                    </Link>
                    <div className="h-px bg-white/5 my-1" aria-hidden="true" />
                    <Button
                      variant="destructive"
                      className="w-full focus-ring"
                      onClick={() => setConfirm({ open: true, id: plan.id })}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={confirm.open}
        onClose={() => setConfirm({ open: false })}
        title="Delete plan?"
        variant="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm({ open: false })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm.id) {
                  onDelete(confirm.id)
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{planToDelete?.target_role}</strong> plan? This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
