import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { orchestrator } from '@/services/agents/orchestrator'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {

  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await orchestrator.computeAndSaveScorecard(params.id)
    return NextResponse.json({ ok: true, siteId: params.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
