import { Component, ErrorInfo, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass p-8 max-w-md w-full text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-white/70">
              We encountered an unexpected error. Please try again or go back to your plans.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mt-4">
                <summary className="text-sm text-white/60 cursor-pointer">Error details</summary>
                <pre className="mt-2 text-xs text-red-400 overflow-auto bg-black/20 p-2 rounded">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
              <Button onClick={this.handleReset}>Try Again</Button>
              <Link to="/plans">
                <Button variant="secondary">Go to Plans</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
