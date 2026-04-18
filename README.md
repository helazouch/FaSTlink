# FaSTLink Platform

FaSTLink is a microservices-based social/community platform.
It includes authentication, entities, publications, events, requests, notifications, analytics, admin configuration, and a modern React frontend.

This README is beginner-friendly and gives you everything needed to run, test, and troubleshoot the project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Explanation](#architecture-explanation)
3. [Setup Steps](#setup-steps)
4. [Run with Docker](#run-with-docker)
5. [Test APIs](#test-apis)
6. [Troubleshooting](#troubleshooting)

## Project Overview

FaSTLink is designed as a distributed platform with:

- A central API Gateway
- Multiple Spring Boot microservices
- One PostgreSQL database per service
- Kafka + Zookeeper for event-driven communication
- Redis and MinIO for infrastructure needs
- A React + TypeScript + Tailwind frontend

Main goals of this architecture:

- Strong service separation
- Independent scaling and deployment
- Clear API boundaries
- Event-driven workflows (notifications, analytics)

## Architecture Explanation

### High-level flow

1. Frontend sends HTTP requests to API Gateway (`:8086`)
2. Gateway routes to the correct backend service (`:8080` to `:8089`)
3. Services persist in their own PostgreSQL database
4. Services publish domain events to Kafka
5. Notification and Analytics services consume events
6. WebSocket routes are exposed through Gateway for realtime channels

### Main backend services

| Service              | Port | Main responsibility                            |
| -------------------- | ---: | ---------------------------------------------- |
| identity-service     | 8080 | Register/login/validate users and roles        |
| entity-service       | 8081 | Manage entities                                |
| publication-service  | 8082 | Manage publications and interactions           |
| event-service        | 8083 | Manage events and participations               |
| community-service    | 8084 | Community-related features + websocket backend |
| request-service      | 8085 | Requests/workflow actions                      |
| api-gateway          | 8086 | Entry point, routing, JWT security             |
| notification-service | 8087 | Notifications and read state                   |
| analytics-service    | 8088 | Analytics snapshots and metrics                |
| admin-service        | 8089 | Admin configs/settings/stats                   |

### Infrastructure services

| Service                             |                                Port(s) | Usage                    |
| ----------------------------------- | -------------------------------------: | ------------------------ |
| PostgreSQL (one per domain service) | internal + mapped by service container | Persistent storage       |
| Kafka                               |                                   9092 | Event bus                |
| Zookeeper                           |                                   2181 | Kafka coordination       |
| Redis                               |                                   6379 | Caching / fast key-value |
| MinIO                               |                             9000, 9001 | Object storage + console |

### Gateway routing and security (important)

- Public endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
- Protected endpoints:
  - Most `/api/v1/**` routes require JWT
- Admin-only endpoints:
  - `/api/v1/admin/**` requires role `ADMIN`

WebSocket routes via Gateway:

- `/ws-community/**`
- `/ws-notifications/**`

## Setup Steps

### 1. Prerequisites

Install these tools first:

- Docker Desktop (with Docker Compose)
- Java 17+
- Maven 3.9+
- Node.js 20+ and npm 10+
- Git

### 2. Clone and enter project

```bash
git clone <your-repository-url>
cd FaSTLink/fast-link
```

### 3. Frontend setup (optional if using only backend APIs)

```bash
cd apps/web-client
npm install
copy .env.example .env
npm run dev
```

Frontend default URL:

- `http://localhost:5173`

Go back to project root for Docker commands:

```bash
cd ../..
```

## Run with Docker

### Start the complete platform

From `fast-link` folder:

```bash
docker compose up --build -d
```

If you are one level above (`FaSTLink`), use:

```bash
docker compose -f "fast-link/docker-compose.yml" up --build -d
```

### Check status

```bash
docker compose ps
```

Expected important endpoints:

- Gateway: `http://localhost:8086`
- Gateway health: `http://localhost:8086/actuator/health`
- MinIO console: `http://localhost:9001` (`minioadmin` / `minioadmin`)

### View logs

```bash
docker compose logs -f api-gateway
docker compose logs -f identity-service
```

### Stop platform

```bash
docker compose down
```

### Stop and delete all volumes (full reset)

```bash
docker compose down -v
```

## Test APIs

All examples below go through API Gateway (`http://localhost:8086`).

### A. Register a user (PowerShell)

```powershell
$registerBody = @{
	nomComplet = "Test User"
	email = "test.user@fastlink.dev"
	motDePasse = "StrongPass123!"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/auth/register" `
	-Method Post `
	-ContentType "application/json" `
	-Body $registerBody

$token = $registerResponse.accessToken
$userId = $registerResponse.utilisateur.id
```

### B. Login (PowerShell)

```powershell
$loginBody = @{
	email = "test.user@fastlink.dev"
	motDePasse = "StrongPass123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/auth/login" `
	-Method Post `
	-ContentType "application/json" `
	-Body $loginBody

$token = $loginResponse.accessToken
$userId = $loginResponse.utilisateur.id
```

### C. Validate token

```powershell
Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/auth/validate" `
	-Method Get `
	-Headers @{ Authorization = "Bearer $token" }
```

### D. Create a publication

```powershell
$publicationBody = @{
	utilisateurId = $userId
	contenu = "Hello from FaSTLink"
	entiteIds = @(1)
} | ConvertTo-Json

Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/publications" `
	-Method Post `
	-ContentType "application/json" `
	-Headers @{ Authorization = "Bearer $token" } `
	-Body $publicationBody
```

### E. Create an event

```powershell
$start = (Get-Date).AddDays(1).ToUniversalTime().ToString("o")
$end = (Get-Date).AddDays(1).AddHours(2).ToUniversalTime().ToString("o")

$eventBody = @{
	utilisateurId = $userId
	entiteId = 1
	titre = "FaSTLink Demo Event"
	description = "Sample event"
	lieu = "Online"
	debutAt = $start
	finAt = $end
} | ConvertTo-Json

Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/events" `
	-Method Post `
	-ContentType "application/json" `
	-Headers @{ Authorization = "Bearer $token" } `
	-Body $eventBody
```

### F. Get notifications for a user

```powershell
Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/notifications?utilisateurId=$userId" `
	-Method Get `
	-Headers @{ Authorization = "Bearer $token" }
```

### G. Mark a notification as read

```powershell
$notificationId = 1

Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/notifications/$notificationId/read?utilisateurId=$userId" `
	-Method Post `
	-Headers @{ Authorization = "Bearer $token" }
```

### H. Analytics and admin stats

```powershell
Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/analytics/entities/1/latest" `
	-Method Get `
	-Headers @{ Authorization = "Bearer $token" }
```

```powershell
Invoke-RestMethod `
	-Uri "http://localhost:8086/api/v1/admin/stats/global" `
	-Method Get `
	-Headers @{ Authorization = "Bearer $token" }
```

Note: admin endpoints require an `ADMIN` role token.

## Troubleshooting

### 1) Docker daemon is not running

Symptom:

- `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`

Fix:

1. Start Docker Desktop
2. Wait until Docker is fully ready
3. Run `docker info` to confirm

### 2) Compose says no configuration file found

Symptom:

- `no configuration file provided: not found`

Fix:

- Run command in `fast-link` folder, or specify file explicitly:

```bash
docker compose -f "fast-link/docker-compose.yml" up --build -d
```

### 3) Port already in use

Symptom:

- `Bind for 0.0.0.0:<port> failed: port is already allocated`

Fix:

1. Stop conflicting app/container
2. Or change exposed port in `docker-compose.yml`

### 4) Frontend gets 401 Unauthorized

Cause:

- Most gateway routes are JWT protected.

Fix:

1. Login/register first
2. Ensure token is sent as `Authorization: Bearer <token>`
3. Use a user with `ADMIN` role for `/api/v1/admin/**`

### 5) Frontend stuck loading / data not visible

Possible causes:

- Backend route unavailable
- 401 responses
- Missing entity data

Fix:

1. Check browser network tab
2. Check gateway logs: `docker compose logs -f api-gateway`
3. Check service logs for the target endpoint

### 6) Maven dependencies fail during Docker build

Symptom:

- TLS handshake timeout / artifact download errors

Fix:

1. Verify internet/proxy
2. Retry build command (often transient)
3. Use Docker cache where possible

### 7) Frontend TypeScript cache issues

Symptom:

- Editor shows stale module errors after file changes

Fix:

1. Restart TypeScript server in VS Code
2. Re-run `npm install`
3. Re-run `npm run lint` and `npm run build`

## Useful commands (quick reference)

```bash
# Full stack
docker compose up --build -d
docker compose ps
docker compose logs -f api-gateway
docker compose down

# Frontend
cd apps/web-client
npm install
npm run dev
npm run lint
npm run test
npm run build
```

## Notes

- Root README: this file
- Frontend-specific details: `apps/web-client/README.md`
- Gateway routes and security: `gateway/api-gateway/src/main/resources/application.yml`
