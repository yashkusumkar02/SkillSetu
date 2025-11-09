import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/Card'
import Button from '../components/Button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Page not found</CardTitle>
            <CardDescription>The page you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardFooter className="flex-col gap-2">
            <Link to="/" className="w-full">
              <Button className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="text-sm text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Go Back
            </button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}