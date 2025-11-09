import { TrendingUp, Clock, Calendar } from 'lucide-react'
import { Card } from './Card'

interface StatsBarProps {
  totalPlans: number
  avgDuration: number
  lastCreated: string | null
}

export default function StatsBar({ totalPlans, avgDuration, lastCreated }: StatsBarProps) {
  const stats = [
    {
      icon: TrendingUp,
      label: 'Total plans',
      value: `${totalPlans}`,
      ariaLabel: `Total plans: ${totalPlans}`,
    },
    {
      icon: Clock,
      label: 'Avg duration',
      value: `${avgDuration} weeks`,
      ariaLabel: `Average duration: ${avgDuration} weeks`,
    },
    {
      icon: Calendar,
      label: 'Last created',
      value: lastCreated || 'Never',
      ariaLabel: `Last created: ${lastCreated || 'Never'}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card
            key={i}
            className="py-4 px-5 transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-brand-500/20"
            aria-label={stat.ariaLabel}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-600/20">
                <Icon className="w-5 h-5 text-brand-400" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/60 mb-0.5">{stat.label}</div>
                <div className="text-lg font-semibold text-white truncate">{stat.value}</div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

