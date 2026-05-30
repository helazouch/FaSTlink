import { httpClient } from '../api/httpClient'
import { getEntityName, hydrateEntityDirectory } from '../referenceDataService'
import type { ServiceRequest, SubmitRequestInput } from '../../types/social'

export interface AssignedRoomInput {
  reservationId?: number
  nomSalleAttribuee: string
}

interface DemandeMaterielDto {
  id: number
  libelle: string
  quantite: number
  details?: string | null
}

interface ReservationSalleDto {
  id: number
  salleId?: number | null
  salleNom?: string | null
  capaciteSouhaitee?: number | null
  nomSalleAttribuee?: string | null
  debutAt?: string | null
  finAt?: string | null
  note?: string | null
}

interface DemandeDto {
  id: number
  entiteId: number
  demandeurUtilisateurId: number
  objet: string
  description: string | null
  type: 'MATERIAL_REQUEST' | 'ROOM_RESERVATION'
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  dateDebut?: string | null
  dateFin?: string | null
  heureDebut?: string | null
  heureFin?: string | null
  decisionCommentaire?: string | null
  decideurUtilisateurId?: number | null
  submittedAt?: string
  decisionAt?: string | null
  createdAt: string
  updatedAt: string
  materiels?: DemandeMaterielDto[]
  reservations?: ReservationSalleDto[]
}

const statusMap: Record<DemandeDto['status'], ServiceRequest['status']> = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

const mapRequest = (payload: DemandeDto): ServiceRequest => ({
  id: payload.id,
  title: payload.objet,
  category: payload.type === 'ROOM_RESERVATION' ? 'Room reservation' : 'Material request',
  description: payload.description ?? '',
  priority: 'medium',
  type: payload.type,
  status: statusMap[payload.status],
  rawStatus: payload.status,
  createdAt: payload.submittedAt ?? payload.createdAt,
  updatedAt: payload.updatedAt,
  processedAt: payload.decisionAt ?? undefined,
  communityId: payload.entiteId,
  communityName: getEntityName(payload.entiteId, `Entity #${payload.entiteId}`),
  requesterUserId: payload.demandeurUtilisateurId,
  processorUserId: payload.decideurUtilisateurId ?? undefined,
  note: payload.decisionCommentaire ?? undefined,
  dateDebut: payload.dateDebut ?? undefined,
  dateFin: payload.dateFin ?? undefined,
  heureDebut: payload.heureDebut ?? undefined,
  heureFin: payload.heureFin ?? undefined,
  materials: (payload.materiels ?? []).map((item) => ({
    id: item.id,
    typeMateriel: item.libelle,
    quantite: item.quantite,
    details: item.details ?? undefined,
  })),
  rooms: (payload.reservations ?? []).map((item) => ({
    id: item.id,
    capaciteSouhaitee: item.capaciteSouhaitee ?? undefined,
    nomSalleAttribuee: item.nomSalleAttribuee ?? item.salleNom ?? undefined,
  })),
})

export const getMyEntityRequests = async (entityId: number): Promise<ServiceRequest[]> => {
  await hydrateEntityDirectory()
  const response = await httpClient.get<DemandeDto[]>('/v1/requests/my-entity', {
    params: { entityId },
  })
  return response.data.map(mapRequest)
}

export const getCoordinatorRequests = async (filters?: {
  status?: DemandeDto['status']
  type?: DemandeDto['type']
}): Promise<ServiceRequest[]> => {
  await hydrateEntityDirectory()
  const response = await httpClient.get<DemandeDto[]>('/v1/requests/queue', {
    params: {
      status: filters?.status,
      type: filters?.type,
    },
  })
  return response.data.map(mapRequest)
}

export const submitRequest = async (input: SubmitRequestInput): Promise<ServiceRequest> => {
  const response = await httpClient.post<DemandeDto>('/v1/requests', {
    entityId: input.communityId,
    type: input.type,
    objet: input.title,
    description: input.description,
    dateDebut: input.dateDebut,
    dateFin: input.dateFin,
    heureDebut: input.heureDebut,
    heureFin: input.heureFin,
    typeMateriel: input.type === 'MATERIAL_REQUEST' ? input.typeMateriel : undefined,
    quantite: input.type === 'MATERIAL_REQUEST' ? input.quantite : undefined,
    nbSallesDemandees: input.type === 'ROOM_RESERVATION' ? input.sallesDemandees.length : undefined,
    sallesDemandees: input.type === 'ROOM_RESERVATION' ? input.sallesDemandees : undefined,
  })

  return mapRequest(response.data)
}

export const markRequestUnderReview = async (requestId: number, note?: string): Promise<ServiceRequest> => {
  const response = await httpClient.patch<DemandeDto>(`/v1/requests/${requestId}/under-review`, { note })
  return mapRequest(response.data)
}

export const approveRequest = async (
  requestId: number,
  note: string,
  assignedRooms: AssignedRoomInput[] = [],
): Promise<ServiceRequest> => {
  const response = await httpClient.patch<DemandeDto>(`/v1/requests/${requestId}/approve`, {
    note,
    assignedRooms,
  })
  return mapRequest(response.data)
}

export const rejectRequest = async (requestId: number, note: string): Promise<ServiceRequest> => {
  const response = await httpClient.patch<DemandeDto>(`/v1/requests/${requestId}/reject`, { note })
  return mapRequest(response.data)
}
