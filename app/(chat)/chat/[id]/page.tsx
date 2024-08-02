import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  // Check if the user is authenticated
  if (!session?.user) {
    return {}
  }

  const chat = await getChat(params.id, session.user.id)

  if (!chat || 'error' in chat) {
    // Redirect if chat is not found or there's an error
    return {
      title: 'Chat not found'
    }
  }

  return {
    title: chat.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = (await auth()) as Session

  // Redirect to login if user is not authenticated
  if (!session?.user) {
    return redirect(`/login?next=/chat/${params.id}`)
  }

  const userId = session.user.id as string
  const chat = await getChat(params.id, userId)
  const missingKeys = await getMissingKeys()

  if (!chat || 'error' in chat) {
    // Redirect to homepage if chat is not found or there's an error
    return redirect('/')
  }

  // Ensure the chat belongs to the current user
  if (chat.userId !== userId) {
    return notFound()
  }

  return (
    <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
      <Chat
        id={chat.id}
        session={session}
        initialMessages={chat.messages}
        missingKeys={missingKeys}
      />
    </AI>
  )
}
