import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { formatDate } from '@/lib/utils'
import { getSharedChat } from '@/app/actions'
import { ChatList } from '@/components/chat-list'
import { FooterText } from '@/components/footer'
import { AI, UIState, getUIStateFromAIState } from '@/lib/chat/actions'

export const runtime = 'edge'
export const preferredRegion = 'home'

interface SharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const chat = await getSharedChat(params.id)

  // Fallback title if chat is not found
  const title = chat?.title.slice(0, 50) ?? 'Chat'

  return {
    title
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const chat = await getSharedChat(params.id)

  if (!chat || !chat.sharePath) {
    // Using notFound() to handle 404 errors
    notFound()
  }

  // Convert chat data into UI state
  const uiState: UIState = getUIStateFromAIState(chat)

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-1 md:-mx-8">
              <h1 className="text-2xl font-bold">{chat.title}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(chat.createdAt)} · {chat.messages.length} messages
              </div>
            </div>
          </div>
        </div>
        {/* Render chat messages with AI component */}
        <AI>
          <ChatList messages={uiState} isShared={true} />
        </AI>
      </div>
      <FooterText className="py-8" />
    </>
  )
}
