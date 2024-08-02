'use server'

import { signIn } from '@/auth'
import { User } from '@/lib/types'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { kv } from '@vercel/kv'
import { ResultCode } from '@/lib/utils'

export async function getUser(email: string) {
  try {
    // Fetch user data from the key-value store
    const user = await kv.hgetall<User>(`user:${email}`)
    return user
  } catch (error) {
    console.error('Failed to retrieve user:', error)
    return null
  }
}

interface Result {
  type: string
  resultCode: ResultCode
}

export async function authenticate(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result | undefined> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate credentials using Zod
    const parsedCredentials = z
      .object({
        email: z.string().email(),
        password: z.string().min(6)
      })
      .safeParse({
        email,
        password
      })

    if (parsedCredentials.success) {
      // Attempt to sign in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      // Check if the sign-in attempt was successful
      if (result?.ok) {
        return {
          type: 'success',
          resultCode: ResultCode.UserLoggedIn
        }
      } else {
        return {
          type: 'error',
          resultCode: ResultCode.InvalidCredentials
        }
      }
    } else {
      return {
        type: 'error',
        resultCode: ResultCode.InvalidCredentials
      }
    }
  } catch (error) {
    // Handle specific AuthError and other errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            type: 'error',
            resultCode: ResultCode.InvalidCredentials
          }
        default:
          return {
            type: 'error',
            resultCode: ResultCode.UnknownError
          }
      }
    } else {
      console.error('Authentication error:', error)
      return {
        type: 'error',
        resultCode: ResultCode.UnknownError
      }
    }
  }
}
