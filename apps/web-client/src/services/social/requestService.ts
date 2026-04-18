import { mockRequests } from '../../data/socialMockData'
import { httpClient } from '../api/httpClient'
import { withFallback } from './fallback'
import type { ServiceRequest, SubmitRequestInput } from '../../types/social'

interface RequestDto {
  id: number
  title: string
  category: string
  description: string
  priority: ServiceRequest['priority']
  status: ServiceRequest['status']
  createdAt: string
  updatedAt: string
  communityId: number
  communityName: string
}

let requestsCache: ServiceRequest[] = [...mockRequests]

const mapRequest = (payload: RequestDto): ServiceRequest => ({
  id: payload.id,
  title: payload.title,
  category: payload.category,
  description: payload.description,
  priority: payload.priority,
  status: payload.status,
  createdAt: payload.createdAt,
  updatedAt: payload.updatedAt,
  communityId: payload.communityId,
  communityName: payload.communityName,
})

const createRequestId = () => Math.round(Date.now() / 10)

export const getMyRequests = async (): Promise<ServiceRequest[]> =>
  withFallback(
    async () => {
      const response = await httpClient.get<RequestDto[]>('/v1/requests/my')
      return response.data.map(mapRequest)
    },
    () => requestsCache,
  )

export const submitRequest = async (input: SubmitRequestInput): Promise<ServiceRequest> =>
  withFallback(
    async () => {
      const response = await httpClient.post<RequestDto>('/v1/requests', input)
      return mapRequest(response.data)
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
