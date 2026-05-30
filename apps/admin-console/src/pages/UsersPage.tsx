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
  updateUserStatus,
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

  const [statusTarget, setStatusTarget] = useState<{ userId: number; enabled: boolean } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

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

  const roleNames = useMemo(() => {
    return (rolesQuery.data ?? []).map((role) => role.name)
  }, [rolesQuery.data])

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: number; roleName: 'ADMIN' | 'USER' }) =>
      assignUserRole(userId, roleName),
    onSuccess: (_, variables) => {
      appendAuditEntry('ASSIGN_ROLE', 'user', String(variables.userId), 'SUCCESS', `Role ${variables.roleName}`)
      setActionError(null)
      setRoleTargetUserId(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error, variables) => {
      appendAuditEntry('ASSIGN_ROLE', 'user', String(variables.userId), 'FAILED', normalizeApiError(error).message)
      setActionError(normalizeApiError(error).message)
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
    },
  })

  const createRoleMutation = useMutation({
    mutationFn: (roleName: 'ADMIN' | 'USER') => createRole(roleName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
  })

  const onManualAssign = () => {
    const parsedUserId = Number(manualUserId)
    if (!Number.isFinite(parsedUserId) || parsedUserId <= 0) {
      setActionError('Manual user id must be a positive number.')
      return
    }

    assignRoleMutation.mutate({
      userId: parsedUserId,
      roleName: (manualRole as 'ADMIN' | 'USER') ?? 'USER',
    })
  }

  return (
    <div className="space-y-5">
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-500/30 dark:bg-red-500/10">
          {actionError}
        </p>
      ) : null}

      <DataTableShell
        title="User management"
        subtitle="Assign roles, activate accounts, and apply access controls from ADMIN endpoints."
        toolbar={
          <>
            <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['admin-users'] })}>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={() => createRoleMutation.mutate('ADMIN')}
              disabled={createRoleMutation.isPending}
            >
              <Plus size={14} />
              Ensure ADMIN role
            </Button>
          </>
        }
      >
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
                  roleName: (selectedRole as 'ADMIN' | 'USER') ?? 'USER',
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
