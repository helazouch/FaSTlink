import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquarePlus, Plus, RefreshCw, UserMinus, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTableShell } from '../components/table/DataTableShell'
import { Pagination } from '../components/table/Pagination'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { Modal } from '../components/ui/Modal'
import { SelectInput } from '../components/ui/SelectInput'
import { TextArea } from '../components/ui/TextArea'
import { TextInput } from '../components/ui/TextInput'
import { appendAuditEntry } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import {
  addCommunityMember,
  createCommunity,
  deleteCommunity,
  listCommunityMembers,
  listCommunityMessages,
  removeCommunityMember,
  sendCommunityMessage,
  updateCommunity,
} from '../services/domain/operationsService'
import { useAuthStore } from '../stores/authStore'

export const CommunitiesPage = () => {
  const queryClient = useQueryClient()
  const actorUserId = useAuthStore((state) => state.user?.id ?? 0)

  const [communityIdInput, setCommunityIdInput] = useState('1')
  const [memberSearch, setMemberSearch] = useState('')
  const [messageSearch, setMessageSearch] = useState('')
  const [memberPage, setMemberPage] = useState(0)
  const [messagePage, setMessagePage] = useState(0)

  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [targetUserId, setTargetUserId] = useState('')
  const [memberRole, setMemberRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')

  const [messageOpen, setMessageOpen] = useState(false)
  const [messageContent, setMessageContent] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [communityDescription, setCommunityDescription] = useState('')

  const [updateOpen, setUpdateOpen] = useState(false)
  const [updateName, setUpdateName] = useState('')
  const [updateDescription, setUpdateDescription] = useState('')

  const [removeTargetUserId, setRemoveTargetUserId] = useState<number | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const communityId = useMemo(() => {
    const parsed = Number(communityIdInput)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }, [communityIdInput])

  const membersQuery = useQuery({
    queryKey: ['community-members', communityId],
    queryFn: () => listCommunityMembers(communityId),
    enabled: communityId > 0,
  })

  const messagesQuery = useQuery({
    queryKey: ['community-messages', communityId, actorUserId],
    queryFn: () => listCommunityMessages(communityId, actorUserId),
    enabled: communityId > 0 && actorUserId > 0,
  })

  const filteredMembers = useMemo(() => {
    const needle = memberSearch.trim().toLowerCase()
    const items = membersQuery.data ?? []

    if (!needle) {
      return items
    }

    return items.filter((item) => {
      return String(item.utilisateurId).includes(needle) || item.role.toLowerCase().includes(needle)
    })
  }, [memberSearch, membersQuery.data])

  const filteredMessages = useMemo(() => {
    const needle = messageSearch.trim().toLowerCase()
    const items = messagesQuery.data ?? []

    if (!needle) {
      return items
    }

    return items.filter((item) => {
      return String(item.utilisateurId).includes(needle) || item.contenu.toLowerCase().includes(needle)
    })
  }, [messageSearch, messagesQuery.data])

  const memberPageSize = 8
  const messagePageSize = 6

  const pagedMembers = filteredMembers.slice(memberPage * memberPageSize, memberPage * memberPageSize + memberPageSize)
  const pagedMessages = filteredMessages.slice(
    messagePage * messagePageSize,
    messagePage * messagePageSize + messagePageSize,
  )

  const addMemberMutation = useMutation({
    mutationFn: () => addCommunityMember(communityId, actorUserId, Number(targetUserId), memberRole),
    onSuccess: () => {
      appendAuditEntry('ADD_COMMUNITY_MEMBER', 'community', String(communityId), 'SUCCESS', `User ${targetUserId}`)
      setAddMemberOpen(false)
      setTargetUserId('')
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['community-members', communityId] })
    },
    onError: (error) => {
      appendAuditEntry('ADD_COMMUNITY_MEMBER', 'community', String(communityId), 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => removeCommunityMember(communityId, userId, actorUserId),
    onSuccess: (_, userId) => {
      appendAuditEntry('REMOVE_COMMUNITY_MEMBER', 'community', String(communityId), 'SUCCESS', `User ${userId}`)
      setRemoveTargetUserId(null)
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['community-members', communityId] })
    },
    onError: (error, userId) => {
      appendAuditEntry('REMOVE_COMMUNITY_MEMBER', 'community', String(communityId), 'FAILED', `User ${userId} - ${normalizeApiError(error).message}`)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: () => sendCommunityMessage(communityId, actorUserId, messageContent),
    onSuccess: () => {
      appendAuditEntry('SEND_COMMUNITY_MESSAGE', 'community', String(communityId), 'SUCCESS', 'Message sent')
      setMessageOpen(false)
      setMessageContent('')
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['community-messages', communityId, actorUserId] })
    },
    onError: (error) => {
      appendAuditEntry('SEND_COMMUNITY_MESSAGE', 'community', String(communityId), 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const createCommunityMutation = useMutation({
    mutationFn: () =>
      createCommunity({
        utilisateurId: actorUserId,
        nom: communityName,
        description: communityDescription,
      }),
    onSuccess: () => {
      appendAuditEntry('CREATE_COMMUNITY', 'community', 'new', 'SUCCESS', communityName)
      setCreateOpen(false)
      setCommunityName('')
      setCommunityDescription('')
      setErrorMessage(null)
    },
    onError: (error) => {
      appendAuditEntry('CREATE_COMMUNITY', 'community', 'new', 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const updateCommunityMutation = useMutation({
    mutationFn: () =>
      updateCommunity(communityId, {
        utilisateurId: actorUserId,
        nom: updateName,
        description: updateDescription,
      }),
    onSuccess: () => {
      appendAuditEntry('UPDATE_COMMUNITY', 'community', String(communityId), 'SUCCESS', updateName)
      setUpdateOpen(false)
      setErrorMessage(null)
    },
    onError: (error) => {
      appendAuditEntry('UPDATE_COMMUNITY', 'community', String(communityId), 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const deleteCommunityMutation = useMutation({
    mutationFn: () => deleteCommunity(communityId, actorUserId),
    onSuccess: () => {
      appendAuditEntry('DELETE_COMMUNITY', 'community', String(communityId), 'SUCCESS', 'Community deleted')
      setDeleteOpen(false)
      setErrorMessage(null)
      void queryClient.removeQueries({ queryKey: ['community-members', communityId] })
      void queryClient.removeQueries({ queryKey: ['community-messages', communityId, actorUserId] })
    },
    onError: (error) => {
      appendAuditEntry('DELETE_COMMUNITY', 'community', String(communityId), 'FAILED', normalizeApiError(error).message)
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  return (
    <div className="space-y-5">
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-500/30 dark:bg-red-500/10">
          {errorMessage}
        </p>
      ) : null}

      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-[170px,1fr,auto,auto,auto,auto]">
          <TextInput
            label="Community id"
            value={communityIdInput}
            onChange={(event) => setCommunityIdInput(event.target.value)}
            placeholder="1"
          />
          <div className="self-end">
            <Button variant="secondary" onClick={() => {
              void queryClient.invalidateQueries({ queryKey: ['community-members', communityId] })
              void queryClient.invalidateQueries({ queryKey: ['community-messages', communityId, actorUserId] })
            }}>
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>
          <Button className="self-end" onClick={() => setCreateOpen(true)}>
            <Plus size={14} />
            Create
          </Button>
          <Button className="self-end" variant="secondary" onClick={() => setUpdateOpen(true)} disabled={communityId <= 0}>
            Update
          </Button>
          <Button className="self-end" variant="danger" onClick={() => setDeleteOpen(true)} disabled={communityId <= 0}>
            Delete
          </Button>
          <Button className="self-end" variant="secondary" onClick={() => setMessageOpen(true)} disabled={communityId <= 0}>
            <MessageSquarePlus size={14} />
            Message
          </Button>
        </div>
      </section>

      <DataTableShell
        title="Community members"
        subtitle="Manage membership roles and removals for selected community."
        toolbar={
          <Button onClick={() => setAddMemberOpen(true)} disabled={communityId <= 0}>
            <UserPlus size={14} />
            Add member
          </Button>
        }
      >
        <div className="border-b border-slate-200 p-4 dark:border-surface-700">
          <TextInput
            label="Filter members"
            value={memberSearch}
            onChange={(event) => {
              setMemberSearch(event.target.value)
              setMemberPage(0)
            }}
            placeholder="User id or role"
          />
        </div>

        {membersQuery.isLoading ? (
          <div className="p-4">
            <Loader label="Loading members..." />
          </div>
        ) : membersQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="Unable to load members"
              message="Check community id and permissions for member listing endpoint."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">User id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Role</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedMembers.length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={4}>
                      No members in current view.
                    </td>
                  </tr>
                ) : (
                  pagedMembers.map((member) => (
                    <tr key={member.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{member.utilisateurId}</td>
                      <td className="table-cell">
                        <Badge tone={member.role === 'ADMIN' ? 'info' : 'neutral'}>{member.role}</Badge>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(member.createdAt)}</td>
                      <td className="table-cell">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setRemoveTargetUserId(member.utilisateurId)}
                        >
                          <UserMinus size={14} />
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination page={memberPage} pageSize={memberPageSize} total={filteredMembers.length} onPageChange={setMemberPage} />
          </>
        )}
      </DataTableShell>

      <DataTableShell title="Community messages" subtitle="Read and send community messages for moderation context.">
        <div className="border-b border-slate-200 p-4 dark:border-surface-700">
          <TextInput
            label="Filter messages"
            value={messageSearch}
            onChange={(event) => {
              setMessageSearch(event.target.value)
              setMessagePage(0)
            }}
            placeholder="User id or content"
          />
        </div>

        {messagesQuery.isLoading ? (
          <div className="p-4">
            <Loader label="Loading messages..." />
          </div>
        ) : messagesQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="Unable to load messages"
              message="Messages endpoint requires valid community id and utilisateurId query parameter."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Message id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">User id</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Content</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                </tr>
              </thead>
              <tbody>
                {pagedMessages.length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={4}>
                      No messages in current view.
                    </td>
                  </tr>
                ) : (
                  pagedMessages.map((message) => (
                    <tr key={message.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{message.id}</td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">#{message.utilisateurId}</td>
                      <td className="table-cell text-slate-700 dark:text-slate-200">{message.contenu}</td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(message.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination page={messagePage} pageSize={messagePageSize} total={filteredMessages.length} onPageChange={setMessagePage} />
          </>
        )}
      </DataTableShell>

      <Modal
        open={addMemberOpen}
        title="Add community member"
        subtitle={`Community #${communityId}`}
        onClose={() => setAddMemberOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addMemberMutation.mutate()}
              disabled={addMemberMutation.isPending || !targetUserId.trim() || communityId <= 0}
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add member'}
            </Button>
          </div>
        }
      >
        <TextInput
          label="Target user id"
          value={targetUserId}
          onChange={(event) => setTargetUserId(event.target.value)}
          placeholder="52"
        />
        <SelectInput
          label="Role"
          value={memberRole}
          onChange={(event) => setMemberRole(event.target.value as 'ADMIN' | 'MEMBER')}
          options={[
            { label: 'ADMIN', value: 'ADMIN' },
            { label: 'MEMBER', value: 'MEMBER' },
          ]}
        />
      </Modal>

      <Modal
        open={messageOpen}
        title="Send message"
        subtitle={`Community #${communityId}`}
        onClose={() => setMessageOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setMessageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => sendMessageMutation.mutate()} disabled={sendMessageMutation.isPending || !messageContent.trim()}>
              {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        }
      >
        <TextArea
          label="Message"
          value={messageContent}
          onChange={(event) => setMessageContent(event.target.value)}
          placeholder="Moderation note"
        />
      </Modal>

      <Modal
        open={createOpen}
        title="Create community"
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createCommunityMutation.mutate()} disabled={createCommunityMutation.isPending || !communityName.trim()}>
              {createCommunityMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        }
      >
        <TextInput label="Name" value={communityName} onChange={(event) => setCommunityName(event.target.value)} />
        <TextArea
          label="Description"
          value={communityDescription}
          onChange={(event) => setCommunityDescription(event.target.value)}
        />
      </Modal>

      <Modal
        open={updateOpen}
        title="Update community"
        subtitle={`Community #${communityId}`}
        onClose={() => setUpdateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateCommunityMutation.mutate()} disabled={updateCommunityMutation.isPending || !updateName.trim()}>
              {updateCommunityMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        }
      >
        <TextInput label="Name" value={updateName} onChange={(event) => setUpdateName(event.target.value)} />
        <TextArea
          label="Description"
          value={updateDescription}
          onChange={(event) => setUpdateDescription(event.target.value)}
        />
      </Modal>

      <ConfirmDialog
        open={removeTargetUserId !== null}
        title="Remove community member"
        description={`Remove user #${removeTargetUserId ?? '-'} from community #${communityId}.`}
        confirmLabel="Remove member"
        tone="danger"
        busy={removeMemberMutation.isPending}
        onCancel={() => setRemoveTargetUserId(null)}
        onConfirm={() => {
          if (removeTargetUserId === null) {
            return
          }

          removeMemberMutation.mutate(removeTargetUserId)
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete community"
        description={`Delete community #${communityId} permanently.`}
        confirmLabel="Delete community"
        tone="danger"
        busy={deleteCommunityMutation.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteCommunityMutation.mutate()}
      />
    </div>
  )
}
