import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, ShieldBan, ShieldCheck } from 'lucide-react'
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
import { TextInput } from '../components/ui/TextInput'
import { appendAuditEntry } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import {
  assignUserRole,
  createRole,
  listRoles,
  listUsers,
  removeUserRole,
  updateUserStatus,
  type GlobalRoleName,
} from '../services/admin/adminService'
import { useAuthStore } from '../stores/authStore'

export const UsersPage = () => {
  const queryClient = useQueryClient()
  const actorUserId = useAuthStore((state) => state.user?.id ?? 0)

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [roleTargetUserId, setRoleTargetUserId] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState('USER')
  const [removeRoleTarget, setRemoveRoleTarget] = useState<{ userId: number; roleName: GlobalRoleName } | null>(null)

  const [statusTarget, setStatusTarget] = useState<{ userId: number; enabled: boolean } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const [isEnsuringCoordinatorRole, setIsEnsuringCoordinatorRole] = useState(false)
  const [assigningCoordinatorUserId, setAssigningCoordinatorUserId] = useState<number | null>(null)

  const [manualUserId, setManualUserId] = useState('')
  const [manualRole, setManualRole] = useState('USER')

  const pageSize = 10

  const rolesQuery = useQuery({
    queryKey: ['admin-roles'],
    queryFn: listRoles,
  })

  const usersQuery = useQuery({
    queryKey: ['admin-users', page, pageSize, search, roleFilter, statusFilter],
    queryFn: () =>
      listUsers({
        page,
        pageSize,
        search,
        role: roleFilter,
        status: statusFilter,
      }),
    retry: false,
  })

  const coordinatorUsersQuery = useQuery({
    queryKey: ['admin-users', 'coordinator-active'],
    queryFn: () =>
      listUsers({
        page: 0,
        pageSize: 5,
        search: '',
        role: 'COORDINATOR',
        status: 'ACTIVE',
      }),
    retry: false,
  })

  const roleNames = useMemo(() => {
    return (rolesQuery.data ?? []).map((role) => role.name)
  }, [rolesQuery.data])
  const hasAdminRole = useAuthStore((state) => state.hasRole('ADMIN'))
  const coordinatorRoleExists = roleNames.includes('COORDINATOR')
  const activeCoordinator = useMemo(() => {
    return (coordinatorUsersQuery.data?.items ?? []).find((user) => user.enabled && user.roles.includes('COORDINATOR')) ?? null
  }, [coordinatorUsersQuery.data])

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: number; roleName: GlobalRoleName }) =>
      assignUserRole(userId, roleName),
    onSuccess: (_, variables) => {
      appendAuditEntry('ASSIGN_ROLE', 'user', String(variables.userId), 'SUCCESS', `Role ${variables.roleName}`)
      setActionError(null)
      setActionNotice(`Role ${variables.roleName} assigned.`)
      setRoleTargetUserId(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error, variables) => {
      appendAuditEntry('ASSIGN_ROLE', 'user', String(variables.userId), 'FAILED', normalizeApiError(error).message)
      setActionError(normalizeApiError(error).message)
      setActionNotice(null)
    },
  })

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: number; roleName: GlobalRoleName }) =>
      removeUserRole(userId, roleName),
    onSuccess: (_, variables) => {
      appendAuditEntry('REMOVE_ROLE', 'user', String(variables.userId), 'SUCCESS', `Role ${variables.roleName}`)
      setActionError(null)
      setActionNotice(`Role ${variables.roleName} removed.`)
      setRemoveRoleTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error, variables) => {
      appendAuditEntry('REMOVE_ROLE', 'user', String(variables.userId), 'FAILED', normalizeApiError(error).message)
      setActionError(normalizeApiError(error).message)
      setActionNotice(null)
    },
  })

  const userStatusMutation = useMutation({
    mutationFn: ({ userId, enabled }: { userId: number; enabled: boolean }) =>
      updateUserStatus(userId, enabled, actorUserId),
    onSuccess: (_, variables) => {
      appendAuditEntry(
        variables.enabled ? 'ACTIVATE_USER' : 'BAN_USER',
        'user',
        String(variables.userId),
        'SUCCESS',
        variables.enabled ? 'User activated' : 'User banned',
      )
      setActionError(null)
      setActionNotice(variables.enabled ? 'User activated.' : 'User banned.')
      setStatusTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error, variables) => {
      appendAuditEntry(
        variables.enabled ? 'ACTIVATE_USER' : 'BAN_USER',
        'user',
        String(variables.userId),
        'FAILED',
        normalizeApiError(error).message,
      )
      setActionError(normalizeApiError(error).message)
      setActionNotice(null)
    },
  })

  const ensureCoordinatorRole = async () => {
    if (!hasAdminRole || isEnsuringCoordinatorRole) {
      return
    }

    setIsEnsuringCoordinatorRole(true)
    setActionError(null)
    setActionNotice(null)

    try {
      await createRole('COORDINATOR')
      await queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      setActionError(null)
      setActionNotice(
        coordinatorRoleExists
          ? 'COORDINATOR role already exists.'
          : 'COORDINATOR role ensured successfully.',
      )
    } catch (error) {
      setActionError(normalizeApiError(error).message)
      setActionNotice(null)
    } finally {
      setIsEnsuringCoordinatorRole(false)
    }
  }

  const assignCoordinatorToUser = async (userId: number, userLabel: string) => {
    if (!hasAdminRole || assigningCoordinatorUserId !== null) {
      return
    }

    if (activeCoordinator && activeCoordinator.id !== userId) {
      setActionError(
        `Only one active coordinator is allowed. Current coordinator: ${activeCoordinator.fullName} (#${activeCoordinator.id}).`,
      )
      setActionNotice(null)
      return
    }

    setAssigningCoordinatorUserId(userId)
    setActionError(null)
    setActionNotice(null)

    try {
      await createRole('COORDINATOR')
      await assignUserRole(userId, 'COORDINATOR')
      appendAuditEntry('ASSIGN_ROLE', 'user', String(userId), 'SUCCESS', 'Role COORDINATOR')
      setActionError(null)
      setActionNotice(`${userLabel} is now assigned as global COORDINATOR.`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-roles'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
      ])
    } catch (error) {
      appendAuditEntry('ASSIGN_ROLE', 'user', String(userId), 'FAILED', normalizeApiError(error).message)
      setActionError(normalizeApiError(error).message)
      setActionNotice(null)
    } finally {
      setAssigningCoordinatorUserId(null)
    }
  }

  const onManualAssign = () => {
    const parsedUserId = Number(manualUserId)
    if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
      setActionError('Manual user id must be a positive number.')
      return
    }

    assignRoleMutation.mutate({
      userId: parsedUserId,
      roleName: (manualRole as GlobalRoleName) ?? 'USER',
    })
  }

  return (
    <div className="space-y-5">
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-500/30 dark:bg-red-500/10">
          {actionError}
        </p>
      ) : null}
      {actionNotice ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {actionNotice}
        </p>
      ) : null}

      <DataTableShell
        title="User management"
        subtitle="Ensure COORDINATOR role only creates the global role if missing. Use Assign coordinator on a user row to give that user the global COORDINATOR role."
        toolbar={
          <>
            <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['admin-users'] })}>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={() => void ensureCoordinatorRole()}
              disabled={!hasAdminRole || isEnsuringCoordinatorRole}
              title={!hasAdminRole ? 'ADMIN role required' : undefined}
            >
              <Plus size={14} />
              {isEnsuringCoordinatorRole ? 'Ensuring...' : 'Ensure COORDINATOR role'}
            </Button>
          </>
        }
      >
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 dark:border-surface-700 dark:bg-surface-800/70 dark:text-slate-300">
          <p>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Ensure COORDINATOR role</span> creates
            the global role if it is missing. It does not assign the role to anyone.
          </p>
          <p className="mt-1">
            <span className="font-semibold text-slate-800 dark:text-slate-100">Assign coordinator</span> gives the
            selected user the global COORDINATOR role. Active coordinator:{' '}
            {activeCoordinator ? `${activeCoordinator.fullName} (#${activeCoordinator.id})` : 'none'}
          </p>
        </div>
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-surface-700 md:grid-cols-4">
          <TextInput
            label="Search users"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Name or email"
          />
          <SelectInput
            label="Role"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value)
              setPage(0)
            }}
            options={[{ label: 'All roles', value: '' }, ...roleNames.map((role) => ({ label: role, value: role }))]}
          />
          <SelectInput
            label="Status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(0)
            }}
            options={[
              { label: 'All statuses', value: '' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Banned', value: 'BANNED' },
            ]}
          />
          <div className="grid grid-cols-2 gap-2 self-end">
            <Button variant="secondary" onClick={() => setPage(0)}>
              Apply
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('')
                setRoleFilter('')
                setStatusFilter('')
                setPage(0)
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {usersQuery.isLoading ? (
          <div className="p-4">
            <Loader label="Loading users..." />
          </div>
        ) : usersQuery.isError ? (
          <div className="p-4">
            <EmptyState
              title="User listing endpoint unavailable"
              message="The backend did not expose a paged user list endpoint. You can still use manual role and status actions below."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">User</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Roles</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Created</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(usersQuery.data?.items ?? []).length === 0 ? (
                  <tr>
                    <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={5}>
                      No users matched your filters.
                    </td>
                  </tr>
                ) : (
                  (usersQuery.data?.items ?? []).map((user) => (
                    <tr key={user.id} className="border-t border-slate-200 dark:border-surface-700">
                      <td className="table-cell text-slate-700 dark:text-slate-200">
                        <p className="font-semibold">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles.map((role) => (
                            <Badge key={`${user.id}-${role}`} tone={role === 'ADMIN' ? 'info' : 'neutral'}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="table-cell">
                        <Badge tone={user.enabled ? 'success' : 'danger'}>{user.enabled ? 'Active' : 'Banned'}</Badge>
                      </td>
                      <td className="table-cell text-slate-600 dark:text-slate-300">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setRoleTargetUserId(user.id)
                              setSelectedRole('USER')
                            }}
                          >
                            Role
                          </Button>
                          {!user.roles.includes('COORDINATOR') ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => void assignCoordinatorToUser(user.id, user.fullName)}
                              disabled={
                                !hasAdminRole ||
                                assigningCoordinatorUserId !== null ||
                                Boolean(activeCoordinator && activeCoordinator.id !== user.id)
                              }
                              title={
                                activeCoordinator && activeCoordinator.id !== user.id
                                  ? `Only one active coordinator is allowed: ${activeCoordinator.fullName}`
                                  : 'Assign COORDINATOR to user'
                              }
                            >
                              {assigningCoordinatorUserId === user.id ? 'Assigning...' : 'Assign coordinator'}
                            </Button>
                          ) : null}
                          {user.roles.includes('COORDINATOR') ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setRemoveRoleTarget({ userId: user.id, roleName: 'COORDINATOR' })}
                            >
                              Remove coordinator
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant={user.enabled ? 'danger' : 'secondary'}
                            onClick={() => setStatusTarget({ userId: user.id, enabled: !user.enabled })}
                          >
                            {user.enabled ? <ShieldBan size={14} /> : <ShieldCheck size={14} />}
                            {user.enabled ? 'Ban' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <Pagination
              page={usersQuery.data?.page ?? 0}
              pageSize={usersQuery.data?.pageSize ?? pageSize}
              total={usersQuery.data?.total ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </DataTableShell>

      <section className="panel p-4">
        <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-slate-100">Manual user actions</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Use this when listing endpoint is not deployed but role/status operations are available.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[160px,1fr,180px,180px]">
          <TextInput
            label="User id"
            value={manualUserId}
            onChange={(event) => setManualUserId(event.target.value)}
            placeholder="42"
          />
          <SelectInput
            label="Role"
            value={manualRole}
            onChange={(event) => setManualRole(event.target.value)}
            options={roleNames.map((role) => ({ label: role, value: role }))}
          />
          <Button className="self-end" onClick={onManualAssign} disabled={assignRoleMutation.isPending}>
            Assign role
          </Button>
          <Button
            className="self-end"
            variant="secondary"
            onClick={() => {
              const parsedUserId = Number(manualUserId)
              if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
                setActionError('Manual user id must be a positive number.')
                return
              }

              userStatusMutation.mutate({ userId: parsedUserId, enabled: true })
            }}
            disabled={userStatusMutation.isPending}
          >
            Activate
          </Button>
        </div>
      </section>

      <Modal
        open={roleTargetUserId !== null}
        title="Assign user role"
        subtitle={`User #${roleTargetUserId ?? '-'}`}
        onClose={() => setRoleTargetUserId(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRoleTargetUserId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!roleTargetUserId) {
                  return
                }

                assignRoleMutation.mutate({
                  userId: roleTargetUserId,
                  roleName: (selectedRole as GlobalRoleName) ?? 'USER',
                })
              }}
              disabled={assignRoleMutation.isPending}
            >
              {assignRoleMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        }
      >
        <SelectInput
          label="Role"
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value)}
          options={roleNames.map((role) => ({ label: role, value: role }))}
        />
      </Modal>

      <ConfirmDialog
        open={removeRoleTarget !== null}
        title="Remove coordinator role"
        description={`Remove ${removeRoleTarget?.roleName ?? 'role'} from user #${removeRoleTarget?.userId ?? '-'}.`}
        confirmLabel="Remove role"
        tone="danger"
        busy={removeRoleMutation.isPending}
        onCancel={() => setRemoveRoleTarget(null)}
        onConfirm={() => {
          if (removeRoleTarget) {
            removeRoleMutation.mutate(removeRoleTarget)
          }
        }}
      />

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.enabled ? 'Activate user' : 'Ban user'}
        description={`Confirm this action for user #${statusTarget?.userId ?? '-'}.`}
        confirmLabel={statusTarget?.enabled ? 'Activate' : 'Ban user'}
        tone={statusTarget?.enabled ? 'primary' : 'danger'}
        busy={userStatusMutation.isPending}
        onCancel={() => setStatusTarget(null)}
        onConfirm={() => {
          if (!statusTarget) {
            return
          }

          userStatusMutation.mutate(statusTarget)
        }}
      />
    </div>
  )
}
