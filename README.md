<div align="center">

<!-- Logo / Banner -->
<img src="https://img.shields.io/badge/UnyKorn-DC--OS-0d1117?style=for-the-badge&labelColor=2196f3&color=0d1117&logoColor=white" alt="UnyKorn DC-OS" height="36"/>

# UnyKorn DC-OS

**Sovereign-Grade AI-Agentic Data Center Acquisition & Due Diligence Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-Proprietary-dc2626?style=flat-square)](LICENSE)
[![Chain](https://img.shields.io/badge/Apostle_Chain-ATP_7332-7c3aed?style=flat-square)](https://apostle.chain)
[![FTH Trading](https://img.shields.io/badge/FTH_Trading-Institutional_Grade-1d4ed8?style=flat-square)](https://github.com/FTHTrading)

> **Classification:** Investor-Grade Institutional Platform &nbsp;|&nbsp; **Version:** 2026.1 &nbsp;|&nbsp; **Standard:** Canovate · Crusoe · Goldman-BCG Power Model

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Due Diligence Standards](#due-diligence-standards)
- [Scoring Engine](#scoring-engine)
- [AI Agent System](#ai-agent-system)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

UnyKorn DC-OS is a **sovereign infrastructure operating system** built for institutional data center operators, family offices, and private equity funds. It automates the complete deal lifecycle — from AI-driven raw site sourcing through full technical/financial due diligence, compliance scoring, portfolio management, and IC-ready memo generation.

```
Raw Listing → AI Qualification → 178-Field Diligence → Weighted Scoring → IC Memo Export
```

**Built to the 2026 Unykorn Institutional Standard**, incorporating:
- Canovate Site Evaluation Framework (full questionnaire)
- Crusoe HPC 100 MW site requirements
- Goldman Sachs / BCG power demand modeling
- OPTKAS sovereign financial architecture (ATP · XRPL · Stellar · Polygon)

### Why DC-OS?

| Capability | Traditional DD | UnyKorn DC-OS |
|---|---|---|
| Site qualification time | 4–8 weeks manual | **< 24 hours AI-assisted** |
| Diligence field coverage | ~40 fields | **178 structured fields** |
| Risk detection | Ad-hoc review | **Automated red-flag engine** |
| IC memo | Manual Word doc | **One-click PDF/Excel export** |
| Multi-site comparison | Spreadsheet | **Live scored comparison** |
| Audit trail | Email chain | **Full immutable audit log** |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Next.js 14 App Router)              │
│  Dashboard · Pipeline · Sites · Approvals · Reports · Agents    │
└──────────────────────┬──────────────────────────────────────────┘
                       │ React Server Components (direct Prisma reads)
┌──────────────────────▼──────────────────────────────────────────┐
│                     Service Layer (TypeScript)                    │
│  ScoringEngine · AgentOrchestrator · SourceRegistry · Exporter  │
└──────────────┬───────────────────────────┬──────────────────────┘
               │ API Routes (mutations)    │ Prisma ORM
┌──────────────▼──────────┐  ┌────────────▼──────────────────────┐
│   AI Agent Workers      │  │         PostgreSQL 15+             │
│  Power · Network        │  │  Sites · Scorecards · Agents       │
│  Compliance · Sourcing  │  │  Workflow · Audit · Receipts       │
│  Document Extraction    │  └────────────────────────────────────┘
└─────────────────────────┘

Chain Settlement Layer (optional):
  Apostle Chain (ATP 7332) ── XRPL ── Stellar ── Polygon EVM
```

### Request Flow

- **Reads** — React Server Components query Prisma directly (zero API overhead)
- **Writes** — Typed API routes with `getServerSession()` guards on every mutation
- **Agent Runs** — Async workers triggered via `POST /api/agents/run`, results stored to DB
- **Exports** — Streaming response, PDF/XLSX generated server-side (no client bundle bloat)

---

## Features

### 🏗️ Site Pipeline Management
- Multi-stage pipeline: `INTAKE → SCREENING → IN_REVIEW → SHORTLISTED → IN_DILIGENCE → APPROVED`
- 178 structured data fields across 14 subsystem categories
- Role-gated stage transitions with mandatory field completion checks
- Full audit log on every state change

### 🤖 AI Agent System (5 Specialist Agents)
| Agent | Scope | Output |
|---|---|---|
| **Power Agent** | Utility, generators, UPS, BTM, PPA | MW capacity scoring, feed risk flags |
| **Network Agent** | Carriers, fiber, IX proximity, latency | Connectivity risk matrix |
| **Compliance Agent** | SOC 2, ISO 27001, CJIS, sovereign suitability | Certification gap analysis |
| **Document Extraction Agent** | PDF/text attachment parsing | Structured fact extraction |
| **Orchestrator** | All subsystems → unified score | Weighted composite + recommendation |

### 📊 8-Category Weighted Scoring Engine
```
Power Infrastructure     ████████████████████ 25%
Cooling Efficiency       ████████████████     18%
Network Connectivity     ████████████         15%
Security & Compliance    ████████████         15%
Financial Structuring    ████████             12%
Environmental / ESG      ██████               8%
Jurisdiction Quality     ██████               5%
Operational Readiness    ████                 2%
```
Auto-generated `recommendation`: **Flagship Fit** (≥85) · **Strategic Fit** (≥70) · **Standard Fit** (≥55) · **Pass** (<55)

### 💰 Financial Modeling
- Capital structure templates (equity, senior debt, mezzanine, LP/GP)
- Target IRR, LTV, DSCR, and common equity tracking
- CRE/HPC/AI mixed-use pro-forma support
- PDF IC memo + Excel model export

### 📋 Workflow & Approvals
- Task management with due dates, priorities, and SLA escalation
- Multi-reviewer approval workflows with IC committee routing
- `OPEN → IN_PROGRESS → REVIEW → CLOSED` task lifecycle

### 🔍 Sourcing Automation
- Source registry with configurable scrape patterns
- Raw listing ingestion, deduplication, and AI normalization
- Broker/advisor relationship tracking

### 📁 Document Management
- Attachment upload with server-side text extraction
- Agent-readable storage with `storageKey` abstraction
- Extracted fact review queue with accept/reject workflow

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14.1 (App Router) | SSR · RSC · API Routes |
| **Language** | TypeScript 5.3 (strict) | Full type safety |
| **ORM** | Prisma 5.22 | Schema-first DB access |
| **Database** | PostgreSQL 15+ | Relational store |
| **Auth** | NextAuth 4.24 (JWT + Credentials) | Session management |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **PDF Export** | jsPDF 2.5 + jspdf-autotable | IC memo generation |
| **Excel Export** | SheetJS (xlsx 0.18) | Financial model export |
| **Chain** | Apostle Chain (ATP 7332) | RWA settlement layer |

---

## Due Diligence Standards

DC-OS implements the full **2026 Unykorn Institutional Standard**, incorporating all three major industry frameworks:

### Minimum Site Thresholds (Crusoe/Canovate Baseline)

| Parameter | Minimum | Target | Elite |
|---|---|---|---|
| IT Load (MW) | 20 MW | 100 MW | 400 MW+ |
| Land (acres) | 25 ac | 100 ac/block | 500 ac+ campus |
| Fiber paths | 1× diverse | 2× geographically diverse | 4× ring topology |
| Bandwidth | 100 Gbps | 1 Tbps | 10 Tbps+ |
| Grid reliability | 99.5% | 99.9% | 99.999% |
| PUE target | < 1.5 | < 1.35 | < 1.2 (AI-optimized) |
| WUE target | < 1.0 L/kWh | < 0.5 L/kWh | < 0.2 L/kWh |
| Generator redundancy | N+1 | 2N | 2N+1 |
| UPS runtime | 15 min | 30 min | 60 min+ |

### Power & Energy Framework
- Behind-the-meter (BTM) generation preferred (Crusoe DFM / stranded gas / solar)
- PPA minimum 10-year fixed-price contracts required for institutional grade
- Grid interconnection queue position verified and documented
- Dual-feed minimum from independent substations

### Compliance Certifications Tracked
`SOC 2 Type II` · `ISO 27001` · `ISO 50001` · `CJIS` · `FedRAMP` · `PCI DSS` · `HIPAA` · `Uptime Institute Tier III/IV`

### Financial Due Diligence Metrics
| Metric | Institutional Floor | Target |
|---|---|---|
| DSCR | ≥ 1.25× | ≥ 1.50× |
| LTV | ≤ 75% | ≤ 65% |
| IRR (levered) | ≥ 15% | ≥ 22% |
| Hold period | 5–7 yr | 7–10 yr |
| Equity multiple | ≥ 1.8× | ≥ 2.5× |

---

## Scoring Engine

The scoring engine evaluates sites across 8 weighted categories, each populated by specialized AI agents and validated against the 2026 Unykorn standard.

```typescript
// config/scoring-weights.ts
export const SCORING_WEIGHTS = {
  power:       0.25,   // MW capacity, feed diversity, BTM, generator autonomy
  cooling:     0.18,   // PUE, WUE, liquid readiness, CDU/immersion
  network:     0.15,   // carrier count, route diversity, IX proximity, bandwidth
  compliance:  0.15,   // SOC2, ISO, CJIS, sovereign suitability, uptime tier
  financial:   0.12,   // DSCR, LTV, IRR, capital stack
  esg:         0.08,   // renewable %, PPA, carbon targets, ESG rating
  jurisdiction: 0.05,  // tax abatement, permitting, utility cooperation
  operational: 0.02,   // staff headcount, NOC/SOC ops, SLA commitments
}
```

### Risk Flags
The engine auto-generates risk flags at `CRITICAL / HIGH / MEDIUM / LOW` severity:
- Single-feed power with no generator backup → `CRITICAL`
- No route diversity → `HIGH`
- DSCR < 1.10× → `CRITICAL`
- Missing SOC 2 for financial infrastructure → `HIGH`
- PUE > 1.6 → `MEDIUM`

---

## AI Agent System

Agents are stateless TypeScript services invoked via `POST /api/agents/run`. Each agent:
1. Reads structured site data from the database
2. Runs deterministic scoring logic (no LLM required for core scoring)
3. Optionally calls OpenAI for document text extraction and narrative generation
4. Writes `AgentRun`, `ExtractedFact`, and `RiskFlag` records
5. Triggers orchestrator to recompute composite score

```typescript
// Trigger an agent run
POST /api/agents/run
{
  "siteId": "uuid",
  "agentType": "POWER" | "NETWORK" | "COMPLIANCE" | "DOCUMENT_EXTRACTION" | "ORCHESTRATOR",
  "attachmentId": "uuid"  // optional, for document extraction
}
```

---

## Data Model

### Core Entities

```
Site (root entity)
├── Utility (power delivery, feed count, BTM, PPA)
├── GeneratorPlant (count, capacity, redundancy, fuel)
├── UPSSystem (topology, runtime, capacity)
├── CoolingSystem (type, PUE, WUE, liquid readiness)
├── NetworkProfile → FiberRoute[]
├── SecurityProfile (mantraps, biometrics, CCTV, SOC/NOC)
├── ComplianceProfile (certifications, sovereign suitability)
├── EnvironmentalProfile (renewables, ESG rating, water)
├── CapitalPlan (equity, debt, IRR, DSCR targets)
├── FinancialModel[] (pro-forma models)
├── JurisdictionProfile (NERC region, tax abatement, IRA credits)
├── Scorecard (8-category weighted composite)
├── RiskFlag[] (severity-tagged flags)
├── WorkflowTask[] (due dates, assignees, SLA)
├── AgentRun[] (execution log, extracted facts)
├── Attachment[] (documents, OCR content)
├── Contact[] (brokers, owners, advisors)
├── AuditLog[] (immutable change log)
└── ApprovalDecision[]
```

### Key Enums

```typescript
SiteStatus:     INTAKE | SCREENING | IN_REVIEW | SHORTLISTED | IN_DILIGENCE | APPROVED | REJECTED | WATCHLIST | ARCHIVED
SiteStage:      SOURCING | INTAKE | SCREENING | TECHNICAL_DD | FINANCIAL_DD | LEGAL_DD | IC_REVIEW | CLOSED_WON | CLOSED_LOST
Recommendation: FLAGSHIP_FIT | STRATEGIC_FIT | STANDARD_FIT | PASS | PENDING
AgentType:      POWER | NETWORK | COMPLIANCE | FINANCIAL | DOCUMENT_EXTRACTION | ORCHESTRATOR
```

---

## API Reference

### Sites

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/sites` | Required | List sites (paginated, filtered) |
| `POST` | `/api/sites` | Required | Create site from intake form |
| `GET` | `/api/sites/:id` | Required | Full site detail (all includes) |
| `PATCH` | `/api/sites/:id` | Required | Update site fields |

### Agents

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/agents/run` | Required | Trigger agent on site |

### Scoring

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sites/:id/score` | Required | Recompute composite score |

### Exports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/exports/pdf` | Required | Executive PDF IC memo |
| `GET` | `/api/exports/technical-pdf` | Required | Technical diligence PDF |
| `GET` | `/api/exports/excel` | Required | Complete Excel model |
| `GET` | `/api/exports/json` | Required | Raw data JSON export |

Query params: `?siteId=uuid` (required for all export endpoints)

### Authentication

```
POST /api/auth/signin     — NextAuth credentials
GET  /api/auth/session    — Active session
POST /api/auth/signout    — Clear session
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 15+ (local or hosted)
- **npm** or **pnpm**

### 1. Clone

```bash
git clone https://github.com/FTHTrading/Data-centers.git
cd Data-centers
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env — minimum required: DATABASE_URL, NEXTAUTH_SECRET
```

### 4. Initialize Database

```bash
# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed with sample sites and users
npx tsx prisma/seed.ts
```

### 5. Start Development Server

```bash
npm run dev
# → http://localhost:3000
```

### Default Credentials (seed data)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@unykorn.com` | `admin123` |
| Analyst | `analyst@unykorn.com` | `analyst123` |
| Power User | `power@unykorn.com` | `analyst123` |
| Executive | `exec@unykorn.com` | `admin123` |

> ⚠️ **Change all passwords before any non-local deployment.**

---

## Environment Variables

```env
# ── Database ────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/unykorn_dc_os?schema=public"

# ── NextAuth ────────────────────────────────────────────────────
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# ── AI / LLM (optional — agents degrade gracefully without this)
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o"

# ── File Storage ────────────────────────────────────────────────
FILE_STORAGE_PATH="./uploads"

# ── Sourcing / Scraping (security allow-list) ───────────────────
SCRAPE_ALLOWED_HOSTS=""
```

---

## Database

### Schema Overview

```bash
npx prisma studio          # Visual DB browser at localhost:5555
npx prisma migrate dev     # Apply schema changes
npx prisma generate        # Regenerate Prisma Client after schema edit
npx tsx prisma/seed.ts     # Re-seed (additive, idempotent by email/name)
```

### Migration Strategy

All schema changes are managed via Prisma Migrate. Never edit the database directly. Migration files in `prisma/migrations/` are version-controlled and must be committed.

---

## Project Structure

```
unykorn-dc-os/
├── app/
│   ├── (auth)/login/           # NextAuth login page
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── page.tsx            # Executive dashboard (KPIs, charts)
│   │   ├── pipeline/           # Site pipeline board
│   │   ├── sites/[id]/         # Full site detail + all subsystems
│   │   ├── sites/new/          # Site intake form
│   │   ├── approvals/          # IC approval queue
│   │   ├── sourcing/           # Raw listing ingestion
│   │   ├── compare/            # Side-by-side site comparison
│   │   ├── agents/             # Agent run history + triggers
│   │   ├── reports/            # Export hub (PDF/Excel/JSON)
│   │   ├── knowledge/          # Scoring reference + glossary
│   │   ├── audit/              # Immutable audit log
│   │   └── settings/           # System configuration
│   ├── api/
│   │   ├── agents/run/         # Agent trigger endpoint
│   │   ├── auth/               # NextAuth handlers
│   │   ├── exports/[type]/     # Export streaming endpoint
│   │   └── sites/              # Site CRUD + score trigger
│   └── layout.tsx              # Root layout (fonts, theme)
├── components/
│   ├── agents/                 # AgentCard, AgentTimeline
│   ├── dashboard/              # KPI widgets, stat cards
│   ├── sites/                  # ScorecardView, SiteCard
│   └── ui/                     # Shared primitives
├── config/
│   ├── glossary.ts             # 60+ DC industry terms
│   ├── jurisdictions.ts        # US state DD suitability rankings
│   └── scoring-weights.ts      # Category weights + labels
├── lib/
│   ├── auth.ts                 # NextAuth config + RBAC
│   ├── db.ts                   # Prisma singleton
│   └── utils.ts                # formatMW, formatScore, formatRelative
├── prisma/
│   ├── schema.prisma           # Full 1,200-line schema (40+ models)
│   ├── seed.ts                 # Sample sites + users
│   └── migrations/             # Version-controlled migrations
├── services/
│   ├── agents/
│   │   ├── orchestrator.ts     # Master scoring agent
│   │   ├── power.ts            # Power infrastructure agent
│   │   ├── network.ts          # Network connectivity agent
│   │   ├── compliance.ts       # Certifications agent
│   │   └── document-extraction.ts  # PDF/text parser
│   ├── scoring/
│   │   └── engine.ts           # 178-field → 8-category composite
│   └── sourcing/
│       └── registry.ts         # SourceRegistry + ScrapeJob CRUD
└── types/
    └── next-auth.d.ts          # Session type augmentation
```

---

## Deployment

### Production Checklist

- [ ] `NEXTAUTH_SECRET` — set to minimum 32-char random string (`openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` — set to production HTTPS domain
- [ ] `DATABASE_URL` — point to production PostgreSQL (RDS, Neon, Supabase)
- [ ] Run `npx prisma migrate deploy` (not `dev`) in production CI/CD
- [ ] `FILE_STORAGE_PATH` — configure persistent storage (S3-compatible or NFS mount)
- [ ] Rotate all seed user passwords before go-live
- [ ] Enable PostgreSQL SSL (`?sslmode=require` in `DATABASE_URL`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `SCRAPE_ALLOWED_HOSTS` allow-list (never `*` in production)

### Vercel (Recommended)

```bash
vercel --prod
# Set env vars in Vercel dashboard → Settings → Environment Variables
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Security

- All API routes require `getServerSession()` authentication — no unauthenticated mutations
- Role-based access: `ADMIN | ANALYST | VIEWER` (enforced at route and component level)
- User passwords are hashed with **bcrypt** (salt rounds: 12) — never stored in plaintext
- Input validated with **Zod** schemas at all API boundaries
- SQL injection impossible — all queries use Prisma parameterized queries
- XSS protected — React/Next.js escapes all rendered output by default
- File uploads restricted to configured `FILE_STORAGE_PATH` with sanitized `storageKey`
- SSRF mitigated via `SCRAPE_ALLOWED_HOSTS` environment allow-list (never wildcard in prod)
- Immutable `AuditLog` table — every state change recorded with userId, timestamp, and diff

See [SECURITY.md](SECURITY.md) for vulnerability reporting procedures.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, commit conventions, and PR requirements.

**Branch naming:**
- `feat/short-description` — new features
- `fix/short-description` — bug fixes
- `chore/short-description` — tooling, deps, config
- `docs/short-description` — documentation only

**Commit format:** `type(scope): description` (Conventional Commits)

---

## License

Copyright © 2026 [FTH Trading](https://github.com/FTHTrading) / Unykorn 7777 Inc.

This software is **proprietary and confidential**. Unauthorized copying, distribution, or use is strictly prohibited. See [LICENSE](LICENSE) for full terms.

---

<div align="center">

Built for **institutional-grade** data center infrastructure investing.

`ATP` · `XRPL` · `Stellar` · `Polygon` · `PostgreSQL` · `Next.js` · `TypeScript`

**[FTH Trading](https://github.com/FTHTrading)** · Unykorn 7777 Inc. · 2026

</div>

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or hosted)
- pnpm (recommended) or npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — random 32-char secret (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with demo data (4 sites, 4 users)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Default credentials (from seed):**
| Email | Password | Role |
|---|---|---|
| `admin@unykorn.com` | `password` | ADMIN |
| `analyst@unykorn.com` | `password` | ANALYST |
| `engineer@unykorn.com` | `password` | ENGINEER |
| `viewer@unykorn.com` | `password` | VIEWER |

---

## Project Structure

```
unykorn-dc-os/
├── app/                          # Next.js App Router
│   ├── (auth)/login/             # Login page
│   ├── (dashboard)/              # Authenticated app shell
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── pipeline/             # Full pipeline table
│   │   ├── sites/[id]/           # Site workspace (full diligence)
│   │   ├── sites/new/            # New site intake form
│   │   ├── compare/              # 2-site comparison view
│   │   ├── agents/               # Agent control center
│   │   ├── approvals/            # Approval queue
│   │   ├── reports/              # Export center
│   │   ├── sourcing/             # Raw listings + qualification
│   │   ├── knowledge/            # Scoring reference + glossary
│   │   ├── audit/                # Audit log
│   │   └── settings/             # Platform config reference
│   └── api/                      # API routes
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── sites/                # CRUD + list + filter
│       ├── sites/[id]/           # Detail + patch + archive
│       ├── sites/[id]/score/     # Recompute scorecard
│       ├── agents/run/           # Trigger agent run
│       └── exports/[type]/       # PDF, XLSX, JSON export
├── components/                   # React components
│   ├── layout/                   # Sidebar, Header
│   ├── ui/                       # Primitives: Button, Badge, Card, Tabs, Input...
│   ├── dashboard/                # KpiCard, PipelineChart
│   ├── sites/                    # ScorecardView, PipelineTable, QualificationChecklist
│   └── agents/                   # AgentCard, AgentTimeline
├── services/                     # Business logic (server-only)
│   ├── scoring/                  # scoreSite(), detectRedFlags()
│   ├── agents/                   # 9 specialized agent classes + orchestrator
│   ├── workflows/                # Task management, SLA enforcement
│   ├── exports/                  # PDF + XLSX generators
│   └── sourcing/                 # Qualification filter, ranking engine, source registry
├── config/                       # Scoring weights, sections, jurisdictions, KPIs, glossary
├── lib/                          # db (Prisma), auth (NextAuth), utils
├── types/                        # Shared TypeScript types + enums
└── prisma/                       # schema.prisma + seed.ts
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript strict check |
| `npm run db:seed` | Seed database |
| `npm run db:reset` | Reset + reseed database |

---

## Scoring System

Sites are scored across 8 weighted categories (0–100 each):

| Category | Weight |
|---|---|
| Power & Expandability | 20% |
| Strategic Fit | 15% |
| Cooling / AI Readiness | 15% |
| Network & Latency | 10% |
| Resilience & Security | 10% |
| Compliance & Sovereignty | 10% |
| Operational Maturity | 10% |
| Financial Attractiveness | 10% |

**Recommendation tiers:**
- **FLAGSHIP** ≥ 80 — Immediate prioritization
- **STRATEGIC** ≥ 65 — Full diligence warranted  
- **STANDARD** ≥ 50 — Proceed with conditions
- **WATCHLIST** ≥ 30 — Monitor / conditional proceed
- **REJECT** < 30 — Do not pursue

---

## Agent System

Nine specialized AI agents cover distinct diligence domains:

| Agent | Domain |
|---|---|
| `INTAKE` | Identity normalization, completeness |
| `DOCUMENT_EXTRACTION` | PDF/text parsing, field extraction |
| `POWER_UTILITY` | Feed analysis, generator redundancy |
| `COOLING_AI_READINESS` | GPU density, PUE, CDU/immersion assessment |
| `NETWORK` | Carrier diversity, dark fiber, IX proximity |
| `COMPLIANCE` | SOC 2, ISO 27001, CJIS, sovereign criteria |
| `RISK` | Auto red-flag detection (18 rule categories) |
| `FINANCIAL_MODELING` | Capital stack, IRR, DSCR, cost/MW |
| `SUMMARY` | Executive brief, IC memo, partner summary |

---

## API Reference

### Sites
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/sites` | List with filters: `stage`, `status`, `recommendation`, `q`, `page`, `limit` |
| `POST` | `/api/sites` | Create new site |
| `GET` | `/api/sites/:id` | Full site detail |
| `PATCH` | `/api/sites/:id` | Partial update |
| `DELETE` | `/api/sites/:id` | Soft-archive (admin only) |
| `POST` | `/api/sites/:id/score` | Recompute scorecard |

### Agents
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/agents/run` | `{ siteId, agentType, attachmentId? }` |

### Exports
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/exports/executive-pdf?siteId=` | Executive PDF |
| `GET` | `/api/exports/technical-pdf?siteId=` | Technical PDF |
| `GET` | `/api/exports/xlsx?siteId=` | Excel workbook |
| `GET` | `/api/exports/json?siteId=` | Raw JSON |

---

## Technology Stack

- **Framework:** Next.js 14.1.3 (App Router, RSC-first)
- **Language:** TypeScript 5.3.3 (strict)
- **Database:** PostgreSQL 15 + Prisma 5.10.0
- **Auth:** NextAuth 4.24.7 (credentials + JWT)
- **Styling:** Tailwind CSS 3.4.1 (dark mode, CSS variables)
- **Exports:** jsPDF 2.5.1, jspdf-autotable 3.8.2, xlsx 0.18.5
- **Validation:** Zod 3.22.4
- **Font:** JetBrains Mono (Google Fonts)
