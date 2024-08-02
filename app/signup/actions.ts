'use server'

import { signIn } from '@/auth'
import { ResultCode, getStringFromBuffer } from '@/lib/utils'
import { z } from 'zod'
import { kv } from '@vercel/kv'
import { getUser } from '../login/actions'
import { AuthError } from 'next-auth'

interface CreateUserResult {
  type: 'success' | 'error'
  resultCode: ResultCode
}

async function createUser(
  email: string,
  hashedPassword: string,
  salt: string
): Promise<CreateUserResult> {
  const existingUser = await getUser(email)

  if (existingUser) {
    return {
      type: 'error',
      resultCode: ResultCode.UserAlreadyExists
    }
  } else {
    const user = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      salt
    }

    await kv.hmset(`user:${email}`, user)

    return {
      type: 'success',
      resultCode: ResultCode.UserCreated
    }
  }
}

export async function signup(
  _prevState: CreateUserResult | undefined,
  formData: FormData
): Promise<CreateUserResult | undefined> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })

  const parsedCredentials = validationSchema.safeParse({ email, password })

  if (!parsedCredentials.success) {
    return {
      type: 'error',
      resultCode: ResultCode.InvalidCredentials
    }
  }

  const salt = crypto.randomUUID()
  const encoder = new TextEncoder()
  const saltedPassword = encoder.encode(password + salt)
  const hashedPasswordBuffer = await crypto.subtle.digest('SHA-256', saltedPassword)
  const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

  try {
    const result = await createUser(email, hashedPassword, salt)

    if (result.resultCode === ResultCode.UserCreated) {
      await signIn('credentials', {
        email,
        password,
        redirect: false
      })
    }

    return result
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        type: 'error',
        resultCode: error.type === 'CredentialsSignin'
          ? ResultCode.InvalidCredentials
          : ResultCode.UnknownError
      }
    } else {
      return {
        type: 'error',
        resultCode: ResultCode.UnknownError
      }
    }
  }
}
