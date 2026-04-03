import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'

const RunSchema = z.object({
  siteId:       z.string().uuid(),
  agentType:    z.enum([
    'INTAKE', 'DOCUMENT_EXTRACTION', 'POWER_UTILITY', 'COOLING_AI_READINESS',
    'NETWORK', 'COMPLIANCE', 'RISK', 'FINANCIAL_MODELING', 'SUMMARY',
  ]),
  attachmentId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RunSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { siteId, agentType, attachmentId } = parsed.data
  const userId = (session.user as { id: string }).id

  try {
    let agent

    switch (agentType) {
      case 'INTAKE': {
        const { IntakeAgent } = await import('@/services/agents/intake')
        agent = new IntakeAgent()
        break
      }
      case 'DOCUMENT_EXTRACTION': {
        const { DocumentExtractionAgent } = await import('@/services/agents/document-extraction')
        agent = new DocumentExtractionAgent()
        break
      }
      case 'POWER_UTILITY': {
        const { PowerUtilityAgent } = await import('@/services/agents/power-utility')
        agent = new PowerUtilityAgent()
        break
      }
      case 'COOLING_AI_READINESS': {
        const { CoolingAIReadinessAgent } = await import('@/services/agents/cooling-ai')
        agent = new CoolingAIReadinessAgent()
        break
      }
      case 'NETWORK': {
        const { NetworkAgent } = await import('@/services/agents/network')
        agent = new NetworkAgent()
        break
      }
      case 'COMPLIANCE': {
        const { ComplianceAgent } = await import('@/services/agents/compliance')
        agent = new ComplianceAgent()
        break
      }
      case 'RISK': {
        const { RiskAgent } = await import('@/services/agents/risk')
        agent = new RiskAgent()
        break
      }
      case 'FINANCIAL_MODELING': {
        const { FinancialModelingAgent } = await import('@/services/agents/financial')
        agent = new FinancialModelingAgent()
        break
      }
      case 'SUMMARY': {
        const { SummaryAgent } = await import('@/services/agents/summary')
        agent = new SummaryAgent()
        break
      }
      default:
        return NextResponse.json({ error: 'Unknown agent type' }, { status: 400 })
    }

    const runId = await agent.run({ siteId, userId, attachmentId })
    return NextResponse.json({ ok: true, runId })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
