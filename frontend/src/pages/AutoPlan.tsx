import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card'
import Button from '../components/Button'
import Textarea from '../components/Textarea'
import TagInput from '../components/TagInput'
import api from '../lib/axios'
import { useToast } from '../hooks/useToast'
import { useNavigate } from 'react-router-dom'

const PRESETS = [
  'Data Scientist',
  'Machine Learning Engineer',
  'Full-Stack Developer',
  'Data Analyst',
  'MLOps Engineer'
]

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateForm(goal: string, skills: string[]): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!goal.trim()) {
    errors.goal = 'Goal is required'
  } else if (goal.trim().length < 10) {
    errors.goal = 'Goal must be at least 10 characters'
  }

  if (skills.length === 0) {
    errors.skills = 'At least one skill is required'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export default function AutoPlan() {
  const [goal, setGoal] = useState('Become a Machine Learning Engineer')
  const [skills, setSkills] = useState<string[]>(['python', 'sql'])
  const [weeks, setWeeks] = useState(12)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showToast } = useToast()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateForm(goal, skills)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setLoading(true)
    try {
      // POST /plans/auto with 120s timeout
      // Smoke test: /plans/auto timeout 120s and friendly 502 message
      const res = await api.post(
        '/plans/auto',
        {
          goal: goal.trim(),
          current_skills: skills,
          duration_weeks: weeks
        },
        { timeout: 120000 }
      )
      showToast('Plan created successfully', 'success')
      const id = res.data.plan_id
      navigate(`/plans/${id}`)
    } catch (e: any) {
      // Error handling:
      // - 401: rely on interceptor (do not toast)
      // - 502: show friendly Ollama message
      // - Else: show error detail
      if (e?.response?.status === 401) {
        // Interceptor will handle token clearing and redirect
        // Do not show toast here
        return
      } else if (e?.response?.status === 502) {
        showToast(
          'AI generator unavailable. Check if Ollama is running and reachable from backend.',
          'error'
        )
      } else {
        const message = e?.response?.data?.detail || 'Failed to create plan'
        showToast(message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const useExample = () => {
    setGoal('Become a Data Scientist')
    setSkills(['python', 'statistics', 'sql'])
    setWeeks(12)
    setErrors({})
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Generate Auto Plan</CardTitle>
            <CardDescription>Create a personalized learning plan based on your goals and current skills</CardDescription>
          </CardHeader>
          <form onSubmit={submit}>
            <CardContent className="space-y-5">
              <Textarea
                label="Goal"
                description="Describe your career goal or what you want to achieve"
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value)
                  if (errors.goal) {
                    setErrors((prev) => ({ ...prev, goal: '' }))
                  }
                }}
                error={errors.goal}
                minLength={10}
                rows={4}
                required
              />
              <div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => {
                        setGoal('Become a ' + p)
                        setErrors((prev) => ({ ...prev, goal: '' }))
                      }}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-brand-600/20 text-brand-200 border border-brand-600/40 hover:bg-brand-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <TagInput
                label="Current skills"
                description="Add your current skills. You can paste multiple skills separated by commas."
                value={skills}
                onChange={(newSkills) => {
                  setSkills(newSkills)
                  if (errors.skills) {
                    setErrors((prev) => ({ ...prev, skills: '' }))
                  }
                }}
                error={errors.skills}
                aria-label="Current skills input"
              />

              <div>
                <label className="block mb-2 text-sm font-medium text-white/90">
                  Duration: {weeks} weeks
                </label>
                <input
                  type="range"
                  min={2}
                  max={24}
                  value={weeks}
                  onChange={(e) => setWeeks(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>2 weeks</span>
                  <span>24 weeks</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {/* Disable submit button while pending to avoid duplicate requests */}
              <Button type="submit" disabled={loading} loading={loading} className="flex-1">
                {loading ? 'Generating…' : 'Generate Plan'}
              </Button>
              <Button type="button" variant="secondary" onClick={useExample} disabled={loading}>
                Use Example
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}