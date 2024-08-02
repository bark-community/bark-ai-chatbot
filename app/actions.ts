'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  const session = await auth()

  if (!userId) {
    return []
  }

  if (userId !== session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, { rev: true })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    console.error('Error getting chats:', error)
    return { error: 'Failed to retrieve chats' }
  }
}

export async function getChat(id: string, userId: string) {
  const session = await auth()

  if (userId !== session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== userId) {
    return { error: 'Chat not found or unauthorized' }
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  if (uid !== session.user.id) {
    return { error: 'Unauthorized' }
  }

  try {
    await kv.del(`chat:${id}`)
    await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)
    revalidatePath('/')
    return revalidatePath(path)
  } catch (error) {
    console.error('Error removing chat:', error)
    return { error: 'Failed to remove chat' }
  }
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
    if (!chats.length) {
      return redirect('/')
    }

    const pipeline = kv.pipeline()

    for (const chat of chats) {
      pipeline.del(chat)
      pipeline.zrem(`user:chat:${session.user.id}`, chat)
    }

    await pipeline.exec()
    revalidatePath('/')
    return redirect('/')
  } catch (error) {
    console.error('Error clearing chats:', error)
    return { error: 'Failed to clear chats' }
  }
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== session.user.id) {
    return { error: 'Something went wrong' }
  }

  try {
    const payload = { ...chat, sharePath: `/share/${chat.id}` }
    await kv.hmset(`chat:${chat.id}`, payload)
    return payload
  } catch (error) {
    console.error('Error sharing chat:', error)
    return { error: 'Failed to share chat' }
  }
}

export async function saveChat(chat: Chat) {
  const session = await auth()

  if (session?.user?.id) {
    try {
      const pipeline = kv.pipeline()
      pipeline.hmset(`chat:${chat.id}`, chat)
      pipeline.zadd(`user:chat:${chat.userId}`, { score: Date.now(), member: `chat:${chat.id}` })
      await pipeline.exec()
    } catch (error) {
      console.error('Error saving chat:', error)
    }
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
