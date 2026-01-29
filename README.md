# Pastebin-Lite

A simple pastebin application where users can create text pastes and share them via URL. Supports time-based expiry (TTL) and view-count limits.

## Run Locally

```bash
npm install
npm start
```

Server runs on http://localhost:8080

## Persistence Layer

**Upstash Redis** is used for production. In development, falls back to in-memory storage.

```bash
# Production environment variables
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

## Design Decisions

- **Storage**: Redis for production, in-memory for development
- **TEST_MODE**: When `TEST_MODE=1`, accepts `x-test-now-ms` header to override current time for expiry testing
- **Security**: HTML content is escaped to prevent XSS
- **Constraints**: When both TTL and max_views are set, paste expires when either triggers first

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| POST | `/api/pastes` | Create paste |
| GET | `/api/pastes/:id` | Get paste (JSON) |
| GET | `/p/:id` | View paste (HTML) |
| GET | `/` | Home page UI |

### Create Paste

```json
POST /api/pastes
{
  "content": "Hello",
  "ttl_seconds": 3600,
  "max_views": 10
}
```

### Response

```json
{
  "id": "abc123",
  "url": "https://your-app.vercel.app/p/abc123"
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 8080) |
| `UPSTASH_REDIS_REST_URL` | Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token |
| `TEST_MODE` | Enable test mode (0 or 1) |
