// services/agents/network.ts
// NetworkAgent — carrier diversity, dark fiber, IX proximity, route diversity, latency exposure

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'

export class NetworkAgent extends BaseAgent {
  readonly agentType = 'NETWORK' as const
  readonly displayName = 'Network & Connectivity Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const facts = []
    const risks = []
    const recs  = []
    const missing: string[] = []

    const profiles = (site.networkProfiles as any[]) ?? []
    const n = profiles[0]

    if (!n) {
      missing.push('Network profile — carrier count, bandwidth, IX proximity')
      risks.push(this.risk('NETWORK_CONNECTIVITY', 'CRITICAL', 'No network data present',
        'Zero network profile records found. Carrier diversity and latency cannot be assessed.',
        'Obtain carrier LOIs or on-site survey before advancing to technical review.'))
    } else {
      // Carrier count
      const carriers = n.carriersOnSite ?? 0
      facts.push(this.fact('networkProfiles.0.carriersOnSite', 'Carriers on site', carriers, 0.9))

      if (carriers === 0) {
        risks.push(this.risk('NETWORK_CONNECTIVITY', 'CRITICAL', 'No fiber on-site',
          'Zero carrier-grade fiber enters the site. All WAN connectivity requires new build-out.',
          'Initiate fiber extension RFQs from nearest carrier PoP. Estimate 12–24 month lead time.'))
      } else if (carriers === 1 && !n.hasDarkFiber) {
        risks.push(this.risk('NETWORK_CONNECTIVITY', 'HIGH', 'Single carrier — no dark fiber alternative',
          'Only one carrier present with no dark fiber option. Any carrier maintenance or cut event severs all WAN.'))
      }

      // Route diversity
      if (!n.hasRouteDiv) {
        risks.push(this.risk('NETWORK_CONNECTIVITY', 'HIGH', 'No route diversity confirmed',
          'Physical path diversity not confirmed. A single conduit cut can sever all carrier traffic simultaneously.'))
      } else {
        facts.push(this.fact('networkProfiles.0.hasRouteDiv', 'Route diversity present', true, 0.85,
          'Confirmed by network profile'))
      }

      // Dark fiber
      if (n.hasDarkFiber) {
        facts.push(this.fact('networkProfiles.0.hasDarkFiber', 'Dark fiber available', true, 0.9))
        recs.push(this.rec('NETWORK',
          'Dark fiber available — negotiate IRU pricing for direct IX or cloud on-ramp connections to reduce recurring carrier cost.',
          0.8))
      }

      // Meet-me room
      if (n.hasMeetMeRoom) {
        facts.push(this.fact('networkProfiles.0.hasMeetMeRoom', 'Meet-me room present', true, 0.9))
        recs.push(this.rec('NETWORK',
          'MMR present — enable cross-connect revenue stream and position as carrier-neutral hosting point.',
          0.75))
      } else {
        recs.push(this.rec('NETWORK',
          'No meet-me room — consider dedicating a cage or room for carrier cross-connects to improve attractiveness for colo tenants.',
          0.6))
      }

      // IX proximity
      const ix = n.ixProximityMiles
      if (ix == null) {
        missing.push('IX proximity (miles)')
      } else {
        facts.push(this.fact('networkProfiles.0.ixProximityMiles', 'IX proximity (miles)', ix, 0.8))
        if (ix > 100) {
          risks.push(this.risk('NETWORK_CONNECTIVITY', 'MEDIUM', 'Remote IX location',
            `Nearest IX is ${ix} miles away. Cloud and CDN latency will be elevated vs. carrier hotel alternatives.`,
            'Evaluate cloud on-ramp availability and direct IX cloud exchange participation to offset geographic latency disadvantage.'))
        }
      }

      // Aggregate bandwidth
      const bw = n.aggregateBandwidthTbps
      if (bw != null) {
        facts.push(this.fact('networkProfiles.0.aggregateBandwidthTbps', 'Aggregate bandwidth (Tbps)', bw, 0.75))
        if (bw < 0.1) {
          risks.push(this.risk('NETWORK_CONNECTIVITY', 'MEDIUM', 'Low aggregate bandwidth',
            `Only ${bw} Tbps aggregate bandwidth on-site — may constrain multi-tenant or AI inference throughput requirements.`))
        }
      } else {
        missing.push('Aggregate bandwidth capacity (Tbps)')
      }
    }

    const filled = [n?.carriersOnSite, n?.hasRouteDiversity, n?.hasDarkFiber, n?.ixProximityMiles, n?.aggregateBandwidthTbps].filter(v => v != null).length
    const confidence = Math.min(0.95, (filled / 5) * 0.9 + ((n?.carriersOnSite ?? 0) > 0 ? 0.05 : 0))

    return {
      agentType: 'NETWORK',
      siteId: input.siteId,
      summary: `Network analysis: ${n?.carriersOnSite ?? 0} on-site carriers, route diversity ${n?.hasRouteDiversity ? 'confirmed' : 'NOT confirmed'}, IX proxy ${n?.ixProximityMiles ?? '?'} mi. ${risks.length} risk(s) flagged.`,
      confidence,
      extractedFacts: facts,
      riskFlags: risks,
      recommendations: recs,
      missingCriticalFields: missing,
    }
  }
}

export const networkAgent = new NetworkAgent()
