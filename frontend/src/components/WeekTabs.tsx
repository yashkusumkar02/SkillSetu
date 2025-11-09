import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import Badge from './Badge'
import { CheckCircle2, ExternalLink, Copy, ChevronDown, ChevronUp } from 'lucide-react'

export type PlanItem = {
  id: string
  week_no: number
  day_no: number
  title: string
  url: string
  est_minutes: number
  type: string
  required_skill?: string
}

interface WeekTabsProps {
  items: PlanItem[]
  completed?: Set<string>
  onToggleCompleted?: (itemId: string) => void
}

export default function WeekTabs({ items, completed = new Set(), onToggleCompleted }: WeekTabsProps) {
  const grouped = useMemo(() => {
    const m = new Map<number, PlanItem[]>()
    items.forEach((i) => {
      const arr = m.get(i.week_no) || []
      arr.push(i)
      m.set(i.week_no, arr)
    })
    const entries = Array.from(m.entries()).sort((a, b) => a[0] - b[0])
    entries.forEach(([, arr]) => arr.sort((a, b) => (a.day_no - b.day_no) || a.title.localeCompare(b.title)))
    return entries
  }, [items])

  const [active, setActive] = useState(grouped[0]?.[0] ?? 1)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([active]))
  const [allExpanded, setAllExpanded] = useState(true)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      { threshold: [1] }
    )

    if (tabsRef.current) {
      observer.observe(tabsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(week)) {
        next.delete(week)
      } else {
        next.add(week)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedWeeks(new Set())
    } else {
      setExpandedWeeks(new Set(grouped.map(([week]) => week)))
    }
    setAllExpanded(!allExpanded)
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 1500)
  }

  const activeWeekItems = grouped.find(([week]) => week === active)?.[1] || []
  const activeWeekCompleted = activeWeekItems.filter((item) => completed.has(item.id)).length

  if (!items?.length) {
    return <div className="text-white/60">No items found.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div
          ref={tabsRef}
          className={`flex gap-2 flex-wrap ${isSticky ? 'sticky top-20 z-10 bg-gray-900/80 backdrop-blur-md py-2 -mx-5 px-5 border-b border-white/10' : ''}`}
        >
          {grouped.map(([week]) => {
            const weekItems = grouped.find(([w]) => w === week)?.[1] || []
            const weekCompleted = weekItems.filter((item) => completed.has(item.id)).length
            const weekTotal = weekItems.length

            return (
              <button
                key={week}
                onClick={() => {
                  setActive(week)
                  if (!expandedWeeks.has(week)) {
                    setExpandedWeeks((prev) => new Set(prev).add(week))
                  }
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  active === week
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Week {week}
                {weekTotal > 0 && (
                  <span className="ml-2 text-xs opacity-75">
                    {weekCompleted}/{weekTotal}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <Button variant="ghost" size="sm" onClick={toggleAll}>
          {allExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Expand All
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {grouped
            .filter(([w]) => w === active)
            .map(([week, arr]) => (
              <motion.div
                key={week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    Week {week} ({activeWeekCompleted}/{activeWeekItems.length} completed)
                  </h3>
                  <button
                    onClick={() => toggleWeek(week)}
                    className="text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
                    aria-label={expandedWeeks.has(week) ? 'Collapse week' : 'Expand week'}
                  >
                    {expandedWeeks.has(week) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {expandedWeeks.has(week) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {arr.map((item, index) => {
                        const isCompleted = completed.has(item.id)
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`glass p-4 flex items-start justify-between gap-4 transition-all ${
                              isCompleted ? 'opacity-75' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="neutral" className="text-xs">
                                  Day {item.day_no}
                                </Badge>
                                <Badge variant="status" className="text-xs capitalize">
                                  {item.type}
                                </Badge>
                                <Badge variant="neutral" className="text-xs">
                                  ~{item.est_minutes}m
                                </Badge>
                              </div>
                              <div className={`font-medium ${isCompleted ? 'line-through text-white/60' : 'text-white'}`}>
                                {item.title}
                              </div>
                              {item.required_skill && (
                                <div className="text-xs text-white/50 mt-1">Skill: {item.required_skill}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {onToggleCompleted && (
                                <button
                                  onClick={() => onToggleCompleted(item.id)}
                                  className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                                    isCompleted
                                      ? 'text-green-400 hover:text-green-300 bg-green-400/10'
                                      : 'text-white/40 hover:text-white/60 hover:bg-white/10'
                                  }`}
                                  aria-label={isCompleted ? 'Mark as not done' : 'Mark as done'}
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                              )}
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
                                aria-label={`Open ${item.title}`}
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                              <button
                                onClick={() => copyUrl(item.url)}
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
                                aria-label="Copy URL"
                              >
                                {copiedUrl === item.url ? (
                                  <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Copy className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  )
}