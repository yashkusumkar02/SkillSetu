import { FilePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './Card'
import Button from './Button'

export default function EmptyState() {
  return (
    <div className="text-center">
      <Card>
        <CardHeader>
          <FilePlus className="mx-auto mb-4 w-12 h-12 text-white/70" aria-hidden="true" />
          <CardTitle>No plans yet</CardTitle>
          <CardDescription>Create your first learning plan automatically with AI.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link to="/plans/auto">
            <Button>New Auto Plan</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}