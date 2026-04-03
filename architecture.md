# UnyKorn DC-OS — Architecture

## System Overview

UnyKorn DC-OS is a multi-layer agentic system for institutional data center acquisition. It combines:

1. **Sourcing pipeline** — ingest raw listings, qualify/disqualify, rank by composite score
2. **Diligence engine** — AI agents populate 178 fields across 14 subsystem categories
3. **Scoring engine** — weighted 8-category scoring with automated red-flag detection
4. **Workflow layer** — task assignment, SLA enforcement, stage gating
5. **Export layer** — executive PDF, technical PDF, Excel, JSON

---

## Request Lifecycle

```
Browser (Next.js App Router)
  └─ Server Component (Prisma direct query)
       └─ Client Component (interactive state)
            └─ API Route (mutate / trigger agent)
                  └─ Service Layer (business logic, no HTTP)
                        └─ Prisma ORM
                              └─ PostgreSQL
```

All **reads** happen in React Server Components via Prisma — no API layer needed for GET.  
All **writes and mutations** go through typed API routes with `getServerSession()` auth guards.

---

## Data Model (Prisma)

Key entities and their relationships:

```
Site (root entity)
  ├─ Scorecard           (1:1, computed by orchestrator)
  ├─ UtilityProfile[]    (power feeds, grid data)
  ├─ GeneratorSystem[]   (generators, fuel, redundancy)
  ├─ UPSSystem[]         (UPS, runtime, redundancy model)
  ├─ CoolingSystem[]     (type, PUE, rack density, CDU/immersion)
  ├─ NetworkProfile[]    (carriers, dark fiber, IX, route diversity)
  │   └─ FiberRoute[]
  ├─ SecurityProfile     (1:1, biometrics, mantrap, SOC/NOC)
  ├─ ComplianceProfile   (1:1, SOC2, ISO27001, CJIS, sovereign)
  ├─ EnvironmentalProfile (1:1, PPA, water stress, flood zone)
  ├─ CapitalPlan         (1:1, cost/MW, IRR, DSCR, capital stack)
  ├─ FinancialModel      (1:1, full 10-year model)
  ├─ JurisdictionProfile (1:1, tax, zoning, incentives)
  ├─ Building[]          (year built, sqft, condition)
  ├─ RiskFlag[]          (auto-generated + manual flags)
  ├─ WorkflowTask[]      (tasks with SLA + assignment)
  ├─ AgentRun[]          (full agent run history)
  │   ├─ ExtractedFact[] (per-run field extractions with confidence)
  │   └─ AgentRecommendation[]
  ├─ Contact[]           (broker, utility, legal contacts)
  ├─ Attachment[]        (uploaded documents for agent processing)
  ├─ AuditLog[]          (all state changes)
  └─ RawListing          (FK, source listing if ingested via registry)
```

---

## Agent Architecture

### BaseAgent (abstract)

```
BaseAgent.run(input: AgentInput): Promise<runId: string>
  1. Create AgentRun (status=RUNNING)
  2. fetchSiteData(siteId) — full Prisma include
  3. this.execute(input, siteData)    ← subclass implements this
  4. persistFacts()                   → ExtractedFact rows
  5. persistRisks()                   → RiskFlag rows
  6. persistRecommendations()         → AgentRecommendation rows
  7. Update AgentRun (status=COMPLETED, durationMs, summary, confidence)
  On error: Update AgentRun (status=FAILED, error)
```

### Agent Registry

| Agent Class | `agentType` | Domain |
|---|---|---|
| `IntakeAgent` | `INTAKE` | Identity normalization |
| `DocumentExtractionAgent` | `DOCUMENT_EXTRACTION` | Regex + keyword extraction from text |
| `PowerUtilityAgent` | `POWER_UTILITY` | Feed analysis, BTM, generator redundancy |
| `CoolingAIReadinessAgent` | `COOLING_AI_READINESS` | GPU density matrix, PUE, CDU/immersion |
| `NetworkAgent` | `NETWORK` | Carrier diversity, dark fiber, IX proximity |
| `ComplianceAgent` | `COMPLIANCE` | SOC2/ISO/CJIS matrix, sovereign hosting |
| `RiskAgent` | `RISK` | 18-rule red flag engine → RiskFlag rows |
| `FinancialModelingAgent` | `FINANCIAL_MODELING` | $12M/MW capex, DSCR, levered IRR |
| `SummaryAgent` | `SUMMARY` | Executive brief, IC memo, partner summary |

### WorkflowOrchestrator

Coordinates multi-agent workflows:
- `advanceStage(siteId, targetStage, userId)` — stage transition + auto-task creation + audit log
- `computeAndSaveScorecard(siteId)` — builds `SiteScoringInput` from all subsystems → `scoreSite()` → upsert `Scorecard`
- `checkSLAs()` — find overdue tasks → escalate

---

## Scoring Engine

### Input → `SiteScoringInput`

A flat TypeScript interface (~35 fields) aggregated from all subsystem models by the orchestrator. All fields are nullable — confidence degrades gracefully.

### Sub-scorers (0–100 each)

Each sub-scorer applies a rule-based point ladder:

1. **Power & Expandability**: Delivered MW (30), Expandable MW (20), Feed diversity + count (15), BTM capacity (10), Generator redundancy model (15), Generator autonomy hours (10)

2. **Strategic Fit**: Target IT MW (30), Site type (20), Jurisdiction tier (20), Max expandable capacity (15), Ownership status (15)

3. **Cooling / AI Readiness**: Max rack kW/rack (30), Cooling technology type (25), Liquid cooling readiness + CDU (20), PUE annual (25)

4. **Network & Latency**: Carriers on-site (30), Route diversity (20), Dark fiber (15), Meet-me room (10), IX proximity miles (15), Aggregate bandwidth (10)

5. **Resilience & Security**: UPS runtime (20), UPS redundancy model (15), Feed diversity (15), Physical security features (25), Generator autonomy (15)

6. **Compliance & Sovereignty**: Sovereign suitability (30), Financial infrastructure suitability (20), Digital asset suitability (10), Certifications SOC2/ISO/CJIS (32), Uptime tier (10)

7. **Operational Maturity**: Grid reliability % (30), Building age (25), Test schedule maintained (15), Generator autonomy (15), SOC/NOC presence (15)

8. **Financial Attractiveness**: PPA price ¢/kWh (30), PPA structure (10), Tax abatement (15), Target levered IRR (20), Project cost/MW (25)

### Weighted Total

```
total = Σ (sub_score[i] × weight[i])
```

Weights: Power 20%, Strategic 15%, Cooling 15%, Network 10%, Resilience 10%, Compliance 10%, Operations 10%, Financial 10%

### Confidence Score

```
confidence = filled_fields / total_fields
```

Ranges 0.0–1.0. Below 0.40: low data quality warning shown in UI.

---

## Red Flag Engine (18 Rules)

Auto-generated `RiskFlag` rows with severity CRITICAL/HIGH/MEDIUM/LOW:

| Flag Code | Trigger Condition |
|---|---|
| `SINGLE_UTILITY_FEED` | feedCount ≤ 1, no BTM |
| `LOW_POWER` | deliveredMW < 5 |
| `GENERATOR_REDUNDANCY` | Generators present but no N+1/2N |
| `GENERATOR_AUTONOMY` | autonomyHours < 24 |
| `UPS_RUNTIME` | upsRuntimeMinutes < 10 |
| `COOLING_DENSITY` | maxRackKw < 10 kW/rack |
| `HIGH_PUE` | PUE > 2.0 |
| `COOLING_MISMATCH` | Air cooling + density claim > 30 kW |
| `NO_FIBER` | carriersOnSite === 0 |
| `SINGLE_CARRIER` | 1 carrier, no dark fiber |
| `NO_ROUTE_DIVERSITY` | hasRouteDiversity = false |
| `COMPLIANCE_MISMATCH` | financialInfra = true, SOC2 = false |
| `SOVEREIGN_GAP` | sovereignSuitable = true, biometrics = false |
| `CJIS_GAPS` | CJIS = true, missing mantrap/biometric/SOC |
| `GRID_RELIABILITY` | reliability < 99.9% |
| `LAND_CONSTRAINED` | target > 100 MW, acres < 20 |

---

## Workflow / Stage Model

### Stage FSM

```
SOURCING → QUALIFICATION → INITIAL_REVIEW → TECHNICAL_REVIEW →
FINANCIAL_REVIEW → COMPLIANCE_REVIEW → EXECUTIVE_REVIEW → APPROVED
                                                          → REJECTED
                                                          → ON_HOLD
```

### Stage Gates

Each stage advancement triggers:
1. Automatic `WorkflowTask` rows with SLA deadlines
2. AuditLog entry
3. Notifications (if configured)

### SLA Enforcement

`orchestrator.checkSLAs()` should run on a cron/schedule. It escalates any `OPEN` or `IN_PROGRESS` task past its `dueDate`.

---

## Authentication

NextAuth credentials provider:
- Email + password (bcrypt, saltRounds=12)
- JWT strategy — `role` embedded in token payload
- `getServerSession(authOptions)` used in all API routes
- Server components read session for personalization

### Role Matrix

| Role | Read | Create Site | Run Agents | Export | Admin |
|---|---|---|---|---|---|
| VIEWER | ✅ | ❌ | ❌ | ✅ | ❌ |
| ANALYST | ✅ | ✅ | ✅ | ✅ | ❌ |
| ENGINEER | ✅ | ✅ | ✅ | ✅ | ❌ |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Export System

### PDF (jsPDF + jspdf-autotable)

- **Executive PDF**: Scorecard breakdown table, recommendation, critical risk summary, rationale paragraph. Target audience: IC committee.
- **Technical PDF**: Structured subsystem rows for Power, Backup Power, Cooling, Network, Security, Compliance. Target audience: engineering team.

### Excel (xlsx)

8-tab workbook:
1. Overview — scorecard summary
2. Power — utility + generator data
3. Cooling — cooling system specs
4. Network — connectivity breakdown
5. Compliance — certification matrix
6. Capital — financial model summary
7. Risk Flags — all open flags
8. Tasks — workflow task list

---

## Sourcing Pipeline

### Source Registry → Raw Listings → Qualification → Site Promotion

```
SourceRegistry (configured data sources)
  └─ ScrapeJob (per-run ingestion job)
        └─ RawListing (one listing per raw record)
              └─ qualifySite() → { qualified, score, reasons, warnings }
                    └─ [PROMOTE] → Site record created, rawListingId linked
```

### Qualification Rules

Hard disqualifiers:
- deliveredMW < 5
- Ownership = CONDEMNED or FORECLOSURE_HOLD
- 3+ CRITICAL risk flags

Soft warnings:
- State not in approved set (WY, TX, ND, SD, MT, NV, AZ, VA, CO, GA, NC, TN, IL, OH, PA, OR, WA, WA, MI)
- Ownership = MARKETED
- deliveredMW < 20

### Ranking Algorithm

```
composite = baseScore × 0.60
          + completeness × 15
          − (criticalFlags × 8 + highFlags × 2)
          + stageUrgency[stage]
          + recommendationBonus[tier]
          + min(deliveredMW / 10, 5)
```

---

## Security Considerations

- All API routes require `getServerSession()` — unauthenticated requests return 401
- DELETE (archive) is admin-only — role checked against session
- Passwords hashed with bcrypt (12 rounds) — never stored plain
- No secrets in client bundle — `.env` vars prefixed `NEXT_PUBLIC_` only for non-sensitive config
- All user inputs validated with Zod before database write
- Audit log records all mutations with userId, action, entityId, changes
- Rate limiting should be added at the reverse proxy or middleware layer for production deployments
