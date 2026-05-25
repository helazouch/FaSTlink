import { httpClient } from '../api/httpClient'
import { getEntityName, hydrateEntityDirectory } from '../referenceDataService'
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

let requestsCache: ServiceRequest[] = []

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
  communityName: getEntityName(payload.entiteId, `Entity #${payload.entiteId}`),
})

export const getMyRequests = async (userId: number): Promise<ServiceRequest[]> =>
  {
    await hydrateEntityDirectory()
    const response = await httpClient.get<DemandeDto[]>('/v1/requests', {
      params: {
        utilisateurId: userId,
      },
    })

    const mapped = response.data.map(mapRequest)
    requestsCache = mapped
    return mapped
  }

export const submitRequest = async (
  input: SubmitRequestInput,
  userId: number,
): Promise<ServiceRequest> => {
  await hydrateEntityDirectory(userId)
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
}
