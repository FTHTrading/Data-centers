import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR  = join(process.cwd(), 'data')
const DATA_FILE = join(DATA_DIR, 'submissions.json')

function readSubmissions(): unknown[] {
  if (!existsSync(DATA_FILE)) return []
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeSubmissions(records: unknown[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate minimum required fields
    const { company, email, projectType } = body as Record<string, string>
    if (!company?.trim() || !email?.trim() || !projectType?.trim()) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Basic email format check (defense in depth — client validates too)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
    }

    const record = {
      id:          randomUUID(),
      submittedAt: new Date().toISOString(),
      company:     String(company).slice(0, 200),
      contact:     String(body.contact  ?? '').slice(0, 200),
      email:       String(email).slice(0, 200),
      projectType: String(projectType).slice(0, 200),
      docTypes:    Array.isArray(body.docTypes) ? body.docTypes.map(String).slice(0, 20) : [],
      link:        String(body.link  ?? '').slice(0, 500),
      notes:       String(body.notes ?? '').slice(0, 2000),
    }

    const submissions = readSubmissions()
    submissions.push(record)
    writeSubmissions(submissions)

    return NextResponse.json({ ok: true, id: record.id })
  } catch (err) {
    console.error('[documents API]', err)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
