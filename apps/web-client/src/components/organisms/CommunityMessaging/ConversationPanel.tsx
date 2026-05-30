import { ConversationHeader } from './ConversationHeader'
import { MessageList } from './MessageList'
import { MessageComposer } from './MessageComposer'
import { useCommunityChat } from '../../../hooks/useCommunityChat'
import type { MyCommunity } from '../../../types/social'

interface ConversationPanelProps {
  community: MyCommunity
}

export const ConversationPanel = ({ community }: ConversationPanelProps) => {
  const { messages, sendMessage, connectionStatus } = useCommunityChat(community.id)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-none bg-slate-50">
      <ConversationHeader
        community={community}
        connectionStatus={connectionStatus}
      />

      <MessageList messages={messages} />

      <MessageComposer
        onSend={sendMessage}
        disabled={connectionStatus === 'offline'}
      />
    </div>
  )
}
