import { mockRequests } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { ServiceRequest, SubmitRequestInput } from '../../types/social'

interface DemandeDto {
  id: number
  entiteId: number
  demandeurUtilisateurId: number
  objet: string
  description: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

let requestsCache: ServiceRequest[] = [...mockRequests]

const mapStatus = (status: DemandeDto['status']): ServiceRequest['status'] => {
  if (status === 'APPROVED') {
    return 'approved'
  }

  if (status === 'REJECTED') {
    return 'rejected'
  }

  return 'pending'
}

const mapRequest = (payload: DemandeDto): ServiceRequest => ({
  id: payload.id,
  title: payload.objet,
  category: 'General',
  description: payload.description,
  priority: 'medium',
  status: mapStatus(payload.status),
  createdAt: payload.submittedAt ?? payload.createdAt,
  updatedAt: payload.updatedAt,
  communityId: payload.entiteId,
  communityName: `Community #${payload.entiteId}`,
})

const createRequestId = () => Math.round(Date.now() / 10)

export const getMyRequests = async (userId: number): Promise<ServiceRequest[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<DemandeDto[]>('/v1/requests', {
        params: {
          utilisateurId: userId,
        },
      })

      return response.data.map(mapRequest)
    },
    () => requestsCache,
  )

export const submitRequest = async (
  input: SubmitRequestInput,
  userId: number,
): Promise<ServiceRequest> =>
  withFallback(
    async () => {
      const response = await httpClient.post<DemandeDto>('/v1/requests', {
        utilisateurId: userId,
        entiteId: input.communityId,
        objet: input.title,
        description: input.description,
        materiels: [],
        reservations: [],
      })

      const created = mapRequest(response.data)
      requestsCache = [created, ...requestsCache]
      return created
    },
    () => {
      const created: ServiceRequest = {
        id: createRequestId(),
        title: input.title,
        category: input.category,
        description: input.description,
        priority: input.priority,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        communityId: input.communityId,
        communityName: `Community #${input.communityId}`,
      }

      requestsCache = [created, ...requestsCache]
      return created
    },
  )
