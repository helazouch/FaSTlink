# FaST Link Web Client

Production-ready social frontend for FaST Link, inspired by familiar social interaction patterns while keeping a distinct design language.

## Stack

- React + TypeScript + Vite
- TailwindCSS
- Zustand (auth/feed/notification/chat state)
- TanStack React Query
- STOMP + SockJS WebSocket clients
- Axios with JWT + refresh token handling

## Implemented Product Scope

- Authentication: login/register with JWT session lifecycle
- Token refresh: automatic refresh retry on 401 when refresh token exists
- Layout shell:
  - Top navigation: logo, search, notifications, messages, user dropdown
  - Left sidebar: Home, Communities, Events, Requests, Saved items
  - Center content feed/pages
  - Right sidebar: suggested communities, upcoming events, active users
- Home feed:
  - Create post composer with media upload preview
  - Infinite feed scrolling
  - Post interactions: like, comment, share, save
  - Comment thread and submission
- Community experience:
  - Community details and filtered feed
  - Real-time community chat panel
- Events:
  - Event list and event detail route
  - Participation states: going, interested, not-going
- Requests:
  - Request submission form
  - Request status tracking list
- Notifications:
  - Notification center with read/unread handling
  - Real-time push updates via WebSocket
- Profile and Saved items pages

## Main Routes

- /login
- /register
- /
- /profile
- /communities
- /communities/:communityId
- /events
- /events/:eventId
- /requests
- /saved
- /messages
- /notifications

## Environment

Create .env from .env.example:

- VITE_API_BASE_URL
- VITE_WS_URL
- VITE_CHAT_TOPIC_PREFIX
- VITE_CHAT_DESTINATION
- VITE_NOTIFICATION_TOPIC_PREFIX
- VITE_ENABLE_WEBSOCKET
- VITE_FEED_PAGE_SIZE
- VITE_DEFAULT_COMMUNITY_ID

## Folder Structure

```text
src/
  components/
    atoms/
    molecules/
    organisms/
    templates/
  config/
  data/
  hooks/
  lib/
  pages/
  providers/
  services/
    api/
    auth/
    social/
    websocket/
  stores/
  types/
```

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

## Quality

```bash
npm run lint
npm run test
npm run build
```
