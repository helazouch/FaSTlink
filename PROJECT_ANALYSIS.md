# FastLink Project Analysis

## Architecture

FastLink is a microservices platform with two React/Vite frontends, a Spring Cloud API gateway, and nine Spring Boot backend services.

### Frontend apps

- `apps/web-client`: social/community client built with React, TypeScript, Vite, Tailwind, React Query, Zustand, and WebSockets
- `apps/admin-console`: admin dashboard built with React, TypeScript, Vite, Tailwind, React Query, Zustand, and Recharts

### Backend services

- `gateway/api-gateway`: Spring Cloud Gateway entrypoint and JWT-aware routing layer
- `services/identity-service`: authentication, user directory, and admin bootstrap
- `services/entity-service`: entity management and membership permissions
- `services/publication-service`: publications, comments, reactions, and media metadata
- `services/event-service`: events and participations
- `services/community-service`: communities, members, messages, and WebSocket chat
- `services/request-service`: requests, room reservations, and approvals
- `services/notification-service`: notification persistence and event consumers
- `services/analytics-service`: analytics snapshots and Kafka consumers
- `services/admin-service`: global configs, platform settings, and audit logs

### Infrastructure

- PostgreSQL: one database per backend service
- Kafka + Zookeeper: event transport
- Redis: cache/utility support
- MinIO: object storage and console
- Docker Compose: primary local runtime

### Scaffolding / empty areas

- `apps/mobile-client` is only a placeholder
- `shared/*` folders are placeholders
- `platform/kubernetes`, `platform/terraform`, `platform/observability`, and `scripts/*` are scaffolded but mostly empty

## Technologies

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Axios, Vitest
- Backend: Java 17, Spring Boot 3.3.3, Spring Web, Spring Security, Spring Data JPA, Flyway, Spring Kafka, WebSocket, Spring Cloud Gateway
- Data: PostgreSQL, Kafka, Redis, MinIO
- Build tools: npm, Maven, Docker Compose

## Detected ports

- `8080`: identity-service
- `8081`: entity-service
- `8082`: publication-service
- `8083`: event-service
- `8084`: community-service
- `8085`: request-service
- `8086`: api-gateway
- `8087`: notification-service
- `8088`: analytics-service
- `8089`: admin-service
- `9000`: MinIO API
- `9001`: MinIO console
- `9092`: Kafka
- `2181`: Zookeeper
- `6379`: Redis
- `5173`: web-client dev server
- `4173`: Vite preview when used

## Dependencies

### Java services

- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-actuator`
- `spring-kafka` on event-driven services
- `spring-boot-starter-websocket` on community-service
- `flyway-core` and `flyway-database-postgresql`
- `postgresql`
- `spring-dotenv`

### Frontends

- `react`, `react-dom`
- `react-router-dom`
- `@tanstack/react-query`
- `axios`
- `zustand`
- `lucide-react`
- `recharts` for admin charts
- `@stomp/stompjs` and `sockjs-client` for chat and notifications

## Startup workflow

### Recommended local startup

1. Start infrastructure and backend services with Docker Compose from `FaSTlink/`
2. Wait for PostgreSQL, Kafka, Redis, and MinIO to become healthy
3. Verify the gateway at `http://localhost:8086/actuator/health`
4. Start the web client in `apps/web-client` if you want the UI outside Docker
5. Start the admin console in `apps/admin-console` if you want the admin UI outside Docker

### Docker Compose command

```bash
docker compose up --build -d
```

## API routes detected

### Gateway routes

- `/api/v1/auth/**`
- `/api/v1/users/**`
- `/api/v1/admin/roles/**`
- `/api/v1/admin/users/**`
- `/api/v1/entities/**`
- `/api/v1/publications/**`
- `/api/v1/events/**`
- `/api/v1/communities/**`
- `/api/v1/requests/**`
- `/api/v1/rooms/**`
- `/api/v1/notifications/**`
- `/api/v1/analytics/**`
- `/api/v1/admin/configs/**`
- `/api/v1/admin/settings/**`
- `/api/v1/admin/stats/**`
- `/api/v1/admin/audit/**`
- `/ws-community/**`
- `/ws-notifications/**`

### Public auth endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/validate`

### Service-level route groups inferred from controllers

- Identity: auth, admin, internal user lookup, user directory
- Entity: entities, memberships, internal permission checks
- Publication: publication CRUD and interactions
- Event: event CRUD and participation
- Community: community CRUD, members, messages, WebSocket chat
- Request: request submission, approval, and room management
- Notification: notification listing and state changes
- Analytics: metrics and statistics
- Admin: global config, settings, stats, and audit logs

## Database schema overview

### Identity

- `roles`
- `utilisateurs`
- `utilisateur_roles`

### Entity

- `entites`
- `utilisateur_role_entite`

### Publication

- `publications`
- `publication_entites_cibles`
- `medias`
- `commentaires`
- `reactions`

### Event

- `evenements`
- `utilisateur_evenement`
- `feedback_evenement`

### Community

- `communautes`
- `membres_communaute`
- `messages_communaute`

### Request

- `salles_demandees`
- `demandes`
- `demandes_materiel`
- `reservation_salles`

### Notification

- `notifications`
- `utilisateur_notifications`

### Analytics

- `statistiques_entites`

### Admin

- `global_configs`
- `platform_settings`
- `audit_logs`

## Troubleshooting notes

- Java and Maven are not installed on the host in this environment, so native Spring Boot runs are blocked unless those tools are added.
- The service `.env.example` files point to remote Neon PostgreSQL endpoints; the new `.env` files switch them to local Docker Compose services.
- `community-service` has a required `DB_PASSWORD` property with no fallback in `application.yml`, so a local `.env` is required for native startup.
- The compose file already wires service-to-service URLs and database credentials, so Docker Compose is the safest runtime path here.
- The README contains an outdated example path (`fast-link`) that does not match the current repository layout.

## Recommendations

- Use Docker Compose as the default local runtime.
- Keep `.env` files in sync with `docker-compose.yml` when ports or credentials change.
- Add a root-level orchestration script or Makefile if you want a single command for local dev.
- Consider adding a real `platform/kubernetes` manifest set and shared OpenAPI docs if the project will be deployed beyond Docker.
