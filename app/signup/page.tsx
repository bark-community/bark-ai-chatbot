import { auth } from '@/auth'
import SignupForm from '@/components/signup-form'
import { Session } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function SignupPage() {
  try {
    // Check for an existing session
    const session = await auth() as Session
    
    // Redirect authenticated users to the home page
    if (session) {
      redirect('/')
    }
  } catch (error) {
    // Handle any potential errors
    console.error('Failed to check authentication:', error)
    // Optionally redirect to an error page or show an error message
    // redirect('/error')
  }

  // Render the signup form if not authenticated
  return (
    <main className="flex flex-col p-4">
      <SignupForm />
    </main>
  )
}
