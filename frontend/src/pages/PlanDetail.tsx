import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../lib/axios'
import { SkeletonCard } from '../components/Skeleton'
import { Card } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import WeekTabs, { PlanItem } from '../components/WeekTabs'
import { useToast } from '../hooks/useToast'
import { timeAgo } from '../utils/date'
import { CheckCircle2, Copy, Check } from 'lucide-react'

type PlanDetail = {
  id: string
  target_role: string
  duration_weeks: number
  status: string
  summary: string
  items: PlanItem[]
  created_at?: string
}

function usePlanProgress(planId: string) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    const key = `plan:${planId}:progress`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setCompleted(new Set(JSON.parse(stored)))
      } catch (e) {
        console.error('Failed to parse plan progress', e)
      }
    }
  }, [planId])

  const toggleCompleted = (itemId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      const key = `plan:${planId}:progress`
      localStorage.setItem(key, JSON.stringify(Array.from(next)))
      return next
    })
  }

  return { completed, toggleCompleted }
}

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  const { completed, toggleCompleted } = usePlanProgress(id || '')

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get(`/plans/${id}`)
        setPlan(res.data)
      } catch (e: any) {
        showToast(e?.response?.data?.detail || 'Failed to load plan', 'error')
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchPlan()
    }
  }, [id, showToast])

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    showToast('Plan link copied', 'success')
    setTimeout(() => setCopied(false), 1500)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-white/70">
        Plan not found.{' '}
        <Link to="/plans" className="text-brand-400 hover:underline">
          Back to plans
        </Link>
      </div>
    )
  }

  const completedCount = plan.items.filter((item) => completed.has(item.id)).length
  const totalCount = plan.items.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm text-white/60 mb-1">{plan.target_role}</div>
          <h2 className="text-2xl font-bold">{plan.duration_weeks} weeks plan</h2>
          <p className="text-white/70 mt-1">{plan.summary}</p>
          {plan.created_at && (
            <div className="text-xs text-white/50 mt-2" title={new Date(plan.created_at).toLocaleString()}>
              Created {timeAgo(plan.created_at)}
            </div>
          )}
          {totalCount > 0 && (
            <div className="text-sm text-white/70 mt-2">
              Progress: {completedCount}/{totalCount} completed
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={copyLink}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy plan link
              </>
            )}
          </Button>
          <Link to="/plans">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      </div>

      <Card>
        <WeekTabs items={plan.items || []} completed={completed} onToggleCompleted={(itemId) => toggleCompleted(itemId)} />
      </Card>
    </div>
  )
}