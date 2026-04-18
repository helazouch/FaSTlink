import { httpClient } from './api/httpClient'
import {
  createPublication,
  getNotifications,
  markNotificationAsRead,
} from './platformService'

vi.mock('./api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('platformService integrations', () => {
  it('maps notifications payload from backend format', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({
      data: [
        {
          notificationId: 9,
          utilisateurId: 1,
          lu: false,
          luAt: null,
          type: 'WARNING',
          titre: 'Storage warning',
          contenu: 'Bucket usage exceeded 80%',
          payloadJson: null,
          sourceEventId: 'evt-44',
          createdAt: '2026-04-17T20:00:00.000Z',
        },
      ],
    })

    const notifications = await getNotifications(1)

    expect(notifications).toEqual([
      {
        id: '9',
        type: 'warning',
        title: 'Storage warning',
        message: 'Bucket usage exceeded 80%',
        createdAt: '2026-04-17T20:00:00.000Z',
        read: false,
        actionLabel: 'Open source event',
      },
    ])
  })

  it('sends create publication payload with backend field names', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: {
        id: 120,
        utilisateurId: 42,
        contenu: 'Hello FastLink',
        entiteIds: [7],
        createdAt: '2026-04-17T20:00:00.000Z',
        updatedAt: '2026-04-17T20:00:00.000Z',
      },
    })

    await createPublication({
      userId: 42,
      content: 'Hello FastLink',
      entityIds: [7],
    })

    expect(httpClient.post).toHaveBeenCalledWith('/v1/publications', {
      utilisateurId: 42,
      contenu: 'Hello FastLink',
      entiteIds: [7],
    })
  })

  it('calls mark notification read endpoint using query parameter contract', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: {
        notificationId: 14,
        utilisateurId: 22,
        lu: true,
        luAt: '2026-04-17T20:00:00.000Z',
        type: 'INFO',
        titre: 'Read',
        contenu: 'Marked',
        payloadJson: null,
        sourceEventId: null,
        createdAt: '2026-04-17T19:59:00.000Z',
      },
    })

    await markNotificationAsRead(14, 22)

    expect(httpClient.post).toHaveBeenCalledWith(
      '/v1/notifications/14/read?utilisateurId=22',
    )
  })
})
