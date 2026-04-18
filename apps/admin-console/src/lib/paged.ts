import type { PagedResult } from '../types/domain'
import { asArray, asObject, toNumber } from './parse'

const extractItems = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  const objectPayload = asObject(payload)
  if (Array.isArray(objectPayload.items)) {
    return objectPayload.items as T[]
  }

  if (Array.isArray(objectPayload.content)) {
    return objectPayload.content as T[]
  }

  if (Array.isArray(objectPayload.data)) {
    return objectPayload.data as T[]
  }

  return []
}

export const normalizePagedResult = <T, U>(
  payload: unknown,
  page: number,
  pageSize: number,
  mapper: (item: T) => U,
): PagedResult<U> => {
  const items = extractItems<T>(payload)
  const objectPayload = asObject(payload)

  const total = toNumber(objectPayload.total, toNumber(objectPayload.totalElements, items.length))
  const resolvedPage = toNumber(objectPayload.page, toNumber(objectPayload.number, page))
  const resolvedSize = toNumber(objectPayload.pageSize, toNumber(objectPayload.size, pageSize))

  return {
    items: asArray<T>(items).map(mapper),
    total,
    page: resolvedPage,
    pageSize: resolvedSize,
  }
}
