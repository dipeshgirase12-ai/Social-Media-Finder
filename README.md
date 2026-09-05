# DevTrace

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-22c55e?style=for-the-badge" alt="status" />
  <img src="https://img.shields.io/badge/Stack-React%20%2B%20Node.js-6366f1?style=for-the-badge" alt="stack" />
  <img src="https://img.shields.io/badge/License-MIT-0f172a?style=for-the-badge" alt="license" />
</p>

<p align="center">
  <strong>Find. Connect. Understand.</strong>
</p>

DevTrace is a privacy-first public developer discovery platform built to help users explore public developer identities, repositories, packages, and website signals in a structured, explainable way.

This product is intentionally designed around public, verifiable information only. It does not scrape private accounts, bypass authentication boundaries, or make claims of identity certainty—it instead surfaces transparent evidence, confidence scoring, and discovery paths that are useful for research, hiring, networking, and technical exploration.

---

## Why DevTrace

Modern developer discovery is fragmented across GitHub, GitLab, npm, personal sites, and public social profiles. DevTrace brings those signals together into one coherent search experience with:

- GitHub and GitLab profile discovery
- Repository health and signal analysis
- npm package visibility
- Website metadata and preview extraction
- Cross-platform matching with explainable evidence
- Saved history and personal account experience
- Secure JWT-based session handling

---

## Core features

### Public discovery engine
- Search by developer name, username, or GitHub URL
- Public profile metadata aggregation from multiple platforms
- Repository discovery and quality signals
- Public website metadata extraction with favicon and preview support
- Safe external-search fallbacks for platforms without public APIs

### Explainable matching
- Cross-platform match scoring based on public signals
- Confidence labels and evidence summaries
- Human-readable metadata used in ranking and display

### Developer workflow tools
- Save favorite profiles
- View search history
- Export saved or historical search results
- Protected authenticated routes with session persistence
- Admin access support for designated addresses

### Production-ready backend
- Express API with validation and structured error handling
- MongoDB persistence for auth, history, and saved items
- Request rate limiting
- CORS and security headers
- In-memory caching strategy for public metadata

---

## Tech stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- React Router

### Backend
- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Zod validation
- Cheerio-based public web scraping metadata extraction

---

## Project structure

```text
.
├── client/                     # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── server/                     # Express backend
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── docker/
│   └── Dockerfile.server
├── package.json
├── docker-compose.yml
├── render.yaml
├── README.md
└── LICENSE
```

---

## Quick start

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection

### 1) Install dependencies

```bash
npm install
npm --prefix server install
npm --prefix client install
```

You can also use:

```bash
npm run install:all
```

### 2) Configure environment

Copy the sample env file:

```bash
copy server\.env.example server\.env
```

Then update the values in `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/devtrace
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
DEMO_MODE=false
ADMIN_EMAILS=you@example.com
```

For a fully local startup, MongoDB must be available. If you want an immediate demo experience without provider credentials, set `DEMO_MODE=true`.

### 3) Run the app

```bash
npm run dev
```

Then open:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

> If 5173 is busy, Vite may use the next available port automatically.

---

## Useful commands

```bash
npm run dev
npm run build
npm run test
npm run lint
```

Single app commands:

```bash
npm --prefix server run dev
npm --prefix client run dev
npm --prefix server run test
npm --prefix client run build
```

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign auth tokens |
| `CLIENT_URL` | Yes | Allowed frontend origin for CORS |
| `GITHUB_TOKEN` | No | Optional GitHub API quota boost |
| `GITLAB_TOKEN` | No | Optional GitLab API quota boost |
| `NPM_API_URL` | No | Override npm registry endpoint |
| `DEMO_MODE` | No | Returns clearly labelled synthetic data |
| `ADMIN_EMAILS` | No | Comma-separated admin list |
| `SEARCH_RATE_LIMIT` | No | Search rate limit per window |
| `CACHE_TTL_SECONDS` | No | Provider cache duration |

---

## API overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Search and discovery
- `POST /api/search`
- `GET /api/search/:id`
- `GET /api/search/history`
- `DELETE /api/search/:id`
- `DELETE /api/search/history`
- `GET /api/search/:id/export`

### Saved profiles
- `GET /api/saved`
- `POST /api/saved`
- `DELETE /api/saved/:platform/:username`

### Platform endpoints
- `GET /api/github/users`
- `GET /api/github/users/:username`
- `GET /api/github/users/:username/repos`
- `GET /api/github/repos/:owner/:repo`
- `GET /api/gitlab/users/:username`
- `GET /api/npm/search`
- `GET /api/website/analyze`

### Health and admin
- `GET /api/health`
- `GET /api/admin/stats`

---

## App behavior and privacy model

DevTrace is designed with a clear ethical and technical boundary:

- It uses only public information
- It does not access private or protected accounts
- It does not accept email addresses as identity search inputs
- Match scores are confidence markers, not definitive identity proof
- Repository and site signals are surfaced as evidence, not guaranteed expertise claims

This makes it suitable for discovery workflows, technical profiling, and networking research without crossing into invasive or private data collection.

---

## Deployment

### Docker

```bash
docker compose up --build
```

The Docker setup is ready for deployment in container-friendly environments such as Render, Railway, or similar hosts.

### Production hosting

For production deployments:
- set `MONGODB_URI`
- set a strong `JWT_SECRET`
- set `CLIENT_URL` to the exact frontend origin
- optionally set GitHub/GitLab tokens for higher quota
- enable HTTPS behind your hosting layer

---

## Testing

The project includes both backend and frontend tests:

```bash
npm --prefix server run test
npm --prefix client run test -- --run
```

The backend coverage includes:
- auth flow validation
- query normalization
- matching logic
- repository health scoring
- rate limiting
- validation contracts

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

Built for public developer discovery, technical research, and professional networking workflows.

If you want to raise the product further, the next strong additions are:
- Redis-backed caching
- richer AI-assisted search summaries
- better profile trust scoring
- richer admin dashboards
- automated deployment pipelines

