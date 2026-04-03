# Contributing to UnyKorn DC-OS

Thank you for contributing. This is a proprietary institutional platform —
all contributions require authorization from FTH Trading.

---

## Access Requirements

You must have a signed **contractor or employment agreement** with FTH Trading
before contributing. All code submitted to this repository becomes the intellectual
property of FTH Trading / Unykorn 7777 Inc. as per your agreement.

---

## Development Setup

```bash
git clone https://github.com/FTHTrading/Data-centers.git
cd Data-centers
npm install
cp .env.example .env
# configure DATABASE_URL in .env
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run dev
```

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready, protected — PR only |
| `dev` | Integration branch — all PRs target here |
| `feat/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Tooling, deps, config, refactor |
| `docs/*` | Documentation only |

**Never commit directly to `main`.** All changes require a PR reviewed by at
least one senior engineer.

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description (present tense, ≤72 chars)

Body (optional): what and why, not how

Closes #issue-number
```

**Types:** `feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `perf` · `ci`

**Scopes:** `sites` · `agents` · `scoring` · `sourcing` · `exports` · `auth` · `db` · `ui`

**Examples:**
```
feat(agents): add financial modeling agent with DSCR scoring
fix(scoring): correct PUE weight normalization for AI campus sites
chore(deps): upgrade Prisma from 5.22 to 5.23
docs(readme): add deployment checklist
```

---

## Pull Request Requirements

- [ ] `tsc --noEmit` passes with **0 errors** (strict mode)
- [ ] `npx prisma validate` passes if schema was changed
- [ ] New API routes have `getServerSession()` auth guards
- [ ] New Prisma fields have a corresponding migration file committed
- [ ] No `.env` secrets committed (check with `git diff --cached`)
- [ ] PR description explains the **why**, not just the what
- [ ] Screenshots attached for UI changes

---

## TypeScript Standards

- **Strict mode** is enforced (`tsconfig.json` → `"strict": true`)
- No `// @ts-ignore` without a comment explaining why
- Prefer `unknown` over `any` at system boundaries; use `as any` sparingly and only inside service/utils layers
- All API route handlers must be fully typed (request body validated with Zod)
- Prisma query results should flow through naturally — avoid unnecessary casting

---

## Database / Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your-migration-name`
3. Commit both the schema change AND the generated migration SQL
4. Update `prisma/seed.ts` if new required fields were added
5. Document new fields in `architecture.md` if they affect the scoring engine

**Never run `prisma migrate reset` on shared environments.**

---

## Security Policy

- Report vulnerabilities to `security@fthtrading.com` — do NOT open public issues
- See [SECURITY.md](SECURITY.md) for full disclosure policy

---

## Code Review Philosophy

- Reviews focus on correctness, security, and schema alignment — not style pedantry
- Tailwind class ordering is not a blocker
- If a PR fixes a real bug, merge it — perfect is the enemy of shipped
- Schema/data model changes require sign-off from the platform lead

---

*Questions? Reach out to the platform lead or open a discussion in the repo.*
