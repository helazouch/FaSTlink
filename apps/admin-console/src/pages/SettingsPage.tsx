import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTableShell } from '../components/table/DataTableShell'
import { Pagination } from '../components/table/Pagination'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Loader } from '../components/ui/Loader'
import { Modal } from '../components/ui/Modal'
import { TextArea } from '../components/ui/TextArea'
import { TextInput } from '../components/ui/TextInput'
import { appendAuditEntry, listLocalAuditEntries } from '../lib/auditTrail'
import { normalizeApiError } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import {
  createGlobalConfig,
  createPlatformSetting,
  deleteGlobalConfig,
  deletePlatformSetting,
  listAuditLogs,
  listGlobalConfigs,
  listPlatformSettings,
  updateGlobalConfig,
  updatePlatformSetting,
} from '../services/admin/adminService'
import { useAuthStore } from '../stores/authStore'

type DeleteTarget = { type: 'setting' | 'config'; id: number } | null

export const SettingsPage = () => {
  const queryClient = useQueryClient()
  const actorUserId = useAuthStore((state) => state.user?.id ?? 0)

  const [settingSearch, setSettingSearch] = useState('')
  const [configSearch, setConfigSearch] = useState('')
  const [settingPage, setSettingPage] = useState(0)
  const [configPage, setConfigPage] = useState(0)
  const [auditPage, setAuditPage] = useState(0)

  const [settingModalOpen, setSettingModalOpen] = useState(false)
  const [settingEditId, setSettingEditId] = useState<number | null>(null)
  const [settingKey, setSettingKey] = useState('')
  const [settingValue, setSettingValue] = useState('')
  const [settingDescription, setSettingDescription] = useState('')
  const [settingEnabled, setSettingEnabled] = useState(true)

  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [configEditId, setConfigEditId] = useState<number | null>(null)
  const [configKey, setConfigKey] = useState('')
  const [configValue, setConfigValue] = useState('')
  const [configDescription, setConfigDescription] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const settingsQuery = useQuery({
    queryKey: ['platform-settings'],
    queryFn: listPlatformSettings,
  })

  const configsQuery = useQuery({
    queryKey: ['global-configs'],
    queryFn: listGlobalConfigs,
  })

  const auditQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => listAuditLogs(200),
    retry: false,
  })

  const filteredSettings = useMemo(() => {
    const needle = settingSearch.trim().toLowerCase()
    const items = settingsQuery.data ?? []

    if (!needle) {
      return items
    }

    return items.filter((item) => {
      return (
        item.settingKey.toLowerCase().includes(needle) ||
        item.settingValue.toLowerCase().includes(needle) ||
        (item.description ?? '').toLowerCase().includes(needle)
      )
    })
  }, [settingSearch, settingsQuery.data])

  const filteredConfigs = useMemo(() => {
    const needle = configSearch.trim().toLowerCase()
    const items = configsQuery.data ?? []

    if (!needle) {
      return items
    }

    return items.filter((item) => {
      return (
        item.configKey.toLowerCase().includes(needle) ||
        item.configValue.toLowerCase().includes(needle) ||
        (item.description ?? '').toLowerCase().includes(needle)
      )
    })
  }, [configSearch, configsQuery.data])

  const auditRows = auditQuery.isError ? listLocalAuditEntries(200) : auditQuery.data ?? []

  const pageSize = 8
  const settingsRows = filteredSettings.slice(settingPage * pageSize, settingPage * pageSize + pageSize)
  const configRows = filteredConfigs.slice(configPage * pageSize, configPage * pageSize + pageSize)
  const auditRowsPaged = auditRows.slice(auditPage * pageSize, auditPage * pageSize + pageSize)

  const createOrUpdateSettingMutation = useMutation({
    mutationFn: () => {
      if (settingEditId) {
        return updatePlatformSetting(settingEditId, {
          settingValue,
          enabled: settingEnabled,
          description: settingDescription,
          updatedByUserId: actorUserId,
        })
      }

      return createPlatformSetting({
        settingKey,
        settingValue,
        enabled: settingEnabled,
        description: settingDescription,
        updatedByUserId: actorUserId,
      })
    },
    onSuccess: (saved) => {
      appendAuditEntry(
        settingEditId ? 'UPDATE_SETTING' : 'CREATE_SETTING',
        'setting',
        String(saved.id),
        'SUCCESS',
        saved.settingKey,
      )
      setSettingModalOpen(false)
      setSettingEditId(null)
      setSettingKey('')
      setSettingValue('')
      setSettingDescription('')
      setSettingEnabled(true)
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['platform-settings'] })
    },
    onError: (error) => {
      appendAuditEntry(
        settingEditId ? 'UPDATE_SETTING' : 'CREATE_SETTING',
        'setting',
        String(settingEditId ?? 'new'),
        'FAILED',
        normalizeApiError(error).message,
      )
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const createOrUpdateConfigMutation = useMutation({
    mutationFn: () => {
      if (configEditId) {
        return updateGlobalConfig(configEditId, {
          configValue,
          description: configDescription,
          updatedByUserId: actorUserId,
        })
      }

      return createGlobalConfig({
        configKey,
        configValue,
        description: configDescription,
        updatedByUserId: actorUserId,
      })
    },
    onSuccess: (saved) => {
      appendAuditEntry(
        configEditId ? 'UPDATE_CONFIG' : 'CREATE_CONFIG',
        'config',
        String(saved.id),
        'SUCCESS',
        saved.configKey,
      )
      setConfigModalOpen(false)
      setConfigEditId(null)
      setConfigKey('')
      setConfigValue('')
      setConfigDescription('')
      setErrorMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['global-configs'] })
    },
    onError: (error) => {
      appendAuditEntry(
        configEditId ? 'UPDATE_CONFIG' : 'CREATE_CONFIG',
        'config',
        String(configEditId ?? 'new'),
        'FAILED',
        normalizeApiError(error).message,
      )
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (target: DeleteTarget) => {
      if (!target) {
        throw new Error('No target selected')
      }

      if (target.type === 'setting') {
        return deletePlatformSetting(target.id)
      }

      return deleteGlobalConfig(target.id)
    },
    onSuccess: (_, target) => {
      if (!target) {
        return
      }

      appendAuditEntry('DELETE_CONFIG_ITEM', target.type, String(target.id), 'SUCCESS', 'Deleted item')
      setDeleteTarget(null)
      setErrorMessage(null)

      if (target.type === 'setting') {
        void queryClient.invalidateQueries({ queryKey: ['platform-settings'] })
      } else {
        void queryClient.invalidateQueries({ queryKey: ['global-configs'] })
      }
    },
    onError: (error, target) => {
      appendAuditEntry(
        'DELETE_CONFIG_ITEM',
        target?.type ?? 'unknown',
        String(target?.id ?? 'unknown'),
        'FAILED',
        normalizeApiError(error).message,
      )
      setErrorMessage(normalizeApiError(error).message)
    },
  })

  if (settingsQuery.isLoading || configsQuery.isLoading) {
    return <Loader label="Loading settings and config data..." />
  }

  return (
    <div className="space-y-5">
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-500/30 dark:bg-red-500/10">
          {errorMessage}
        </p>
      ) : null}

      <DataTableShell
        title="Platform settings"
        subtitle="Toggle and update platform-level runtime settings."
        toolbar={
          <>
            <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['platform-settings'] })}>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setSettingEditId(null)
                setSettingKey('')
                setSettingValue('')
                setSettingDescription('')
                setSettingEnabled(true)
                setSettingModalOpen(true)
              }}
            >
              <Plus size={14} />
              New setting
            </Button>
          </>
        }
      >
        <div className="border-b border-slate-200 p-4 dark:border-surface-700">
          <TextInput
            label="Search settings"
            value={settingSearch}
            onChange={(event) => {
              setSettingSearch(event.target.value)
              setSettingPage(0)
            }}
            placeholder="Key or description"
          />
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-surface-700/60">
            <tr>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Key</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Value</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Updated</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {settingsRows.length === 0 ? (
              <tr>
                <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={5}>
                  No settings match your filter.
                </td>
              </tr>
            ) : (
              settingsRows.map((setting) => (
                <tr key={setting.id} className="border-t border-slate-200 dark:border-surface-700">
                  <td className="table-cell text-slate-700 dark:text-slate-200">{setting.settingKey}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{setting.settingValue}</td>
                  <td className="table-cell">
                    <Badge tone={setting.enabled ? 'success' : 'warning'}>{setting.enabled ? 'Enabled' : 'Disabled'}</Badge>
                  </td>
                  <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(setting.updatedAt)}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSettingEditId(setting.id)
                          setSettingKey(setting.settingKey)
                          setSettingValue(setting.settingValue)
                          setSettingDescription(setting.description ?? '')
                          setSettingEnabled(setting.enabled)
                          setSettingModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget({ type: 'setting', id: setting.id })}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={settingPage} pageSize={pageSize} total={filteredSettings.length} onPageChange={setSettingPage} />
      </DataTableShell>

      <DataTableShell
        title="Global configs"
        subtitle="Manage key/value config entries for admin-service."
        toolbar={
          <>
            <Button variant="secondary" onClick={() => void queryClient.invalidateQueries({ queryKey: ['global-configs'] })}>
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setConfigEditId(null)
                setConfigKey('')
                setConfigValue('')
                setConfigDescription('')
                setConfigModalOpen(true)
              }}
            >
              <Plus size={14} />
              New config
            </Button>
          </>
        }
      >
        <div className="border-b border-slate-200 p-4 dark:border-surface-700">
          <TextInput
            label="Search configs"
            value={configSearch}
            onChange={(event) => {
              setConfigSearch(event.target.value)
              setConfigPage(0)
            }}
            placeholder="Key or description"
          />
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-surface-700/60">
            <tr>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Key</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Value</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Updated</th>
              <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configRows.length === 0 ? (
              <tr>
                <td className="table-cell text-slate-500 dark:text-slate-400" colSpan={4}>
                  No configs match your filter.
                </td>
              </tr>
            ) : (
              configRows.map((config) => (
                <tr key={config.id} className="border-t border-slate-200 dark:border-surface-700">
                  <td className="table-cell text-slate-700 dark:text-slate-200">{config.configKey}</td>
                  <td className="table-cell text-slate-700 dark:text-slate-200">{config.configValue}</td>
                  <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(config.updatedAt)}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setConfigEditId(config.id)
                          setConfigKey(config.configKey)
                          setConfigValue(config.configValue)
                          setConfigDescription(config.description ?? '')
                          setConfigModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget({ type: 'config', id: config.id })}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={configPage} pageSize={pageSize} total={filteredConfigs.length} onPageChange={setConfigPage} />
      </DataTableShell>

      <DataTableShell title="Audit logs" subtitle="Server audit endpoint is used when available, with local fallback.">
        {auditQuery.isLoading ? (
          <div className="p-4">
            <Loader label="Loading audit logs..." />
          </div>
        ) : auditRows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No audit logs"
              message="No audit entries found from server endpoint or local admin action history."
            />
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-surface-700/60">
                <tr>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Time</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Action</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Resource</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  <th className="table-cell text-left font-semibold text-slate-600 dark:text-slate-300">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditRowsPaged.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-200 dark:border-surface-700">
                    <td className="table-cell text-slate-600 dark:text-slate-300">{formatDateTime(entry.createdAt)}</td>
                    <td className="table-cell text-slate-700 dark:text-slate-200">{entry.action}</td>
                    <td className="table-cell text-slate-600 dark:text-slate-300">
                      {entry.resourceType} #{entry.resourceId}
                    </td>
                    <td className="table-cell">
                      <Badge tone={entry.status === 'FAILED' ? 'danger' : 'success'}>{entry.status}</Badge>
                    </td>
                    <td className="table-cell text-slate-600 dark:text-slate-300">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={auditPage} pageSize={pageSize} total={auditRows.length} onPageChange={setAuditPage} />
          </>
        )}
      </DataTableShell>

      <Modal
        open={settingModalOpen}
        title={settingEditId ? 'Edit setting' : 'Create setting'}
        onClose={() => setSettingModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSettingModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createOrUpdateSettingMutation.mutate()}
              disabled={createOrUpdateSettingMutation.isPending || !settingValue.trim() || (!settingEditId && !settingKey.trim())}
            >
              {createOrUpdateSettingMutation.isPending ? 'Saving...' : 'Save setting'}
            </Button>
          </div>
        }
      >
        <TextInput
          label="Setting key"
          value={settingKey}
          onChange={(event) => setSettingKey(event.target.value)}
          disabled={settingEditId !== null}
          placeholder="feature.flag.name"
        />
        <TextInput label="Setting value" value={settingValue} onChange={(event) => setSettingValue(event.target.value)} />
        <TextArea
          label="Description"
          value={settingDescription}
          onChange={(event) => setSettingDescription(event.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={settingEnabled} onChange={(event) => setSettingEnabled(event.target.checked)} />
          Enabled
        </label>
      </Modal>

      <Modal
        open={configModalOpen}
        title={configEditId ? 'Edit config' : 'Create config'}
        onClose={() => setConfigModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createOrUpdateConfigMutation.mutate()}
              disabled={createOrUpdateConfigMutation.isPending || !configValue.trim() || (!configEditId && !configKey.trim())}
            >
              {createOrUpdateConfigMutation.isPending ? 'Saving...' : 'Save config'}
            </Button>
          </div>
        }
      >
        <TextInput
          label="Config key"
          value={configKey}
          onChange={(event) => setConfigKey(event.target.value)}
          disabled={configEditId !== null}
          placeholder="gateway.rate.limit"
        />
        <TextInput label="Config value" value={configValue} onChange={(event) => setConfigValue(event.target.value)} />
        <TextArea
          label="Description"
          value={configDescription}
          onChange={(event) => setConfigDescription(event.target.value)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete ${deleteTarget?.type ?? 'item'}`}
        description={`Delete ${deleteTarget?.type ?? 'item'} #${deleteTarget?.id ?? '-'}. This action is irreversible.`}
        confirmLabel="Delete"
        tone="danger"
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
      />
    </div>
  )
}
