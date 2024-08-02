import { auth } from '@/auth'
import LoginForm from '@/components/login-form'
import { Session } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  try {
    // Check the current session
    const session = (await auth()) as Session

    // Redirect to homepage if user is already authenticated
    if (session) {
      redirect('/')
    }
  } catch (error) {
    console.error('Failed to check authentication:', error)
    // Optionally handle or display error here
  }

  // Render the login form if user is not authenticated
  return (
    <main className="flex flex-col p-4">
      <LoginForm />
    </main>
  )
}
