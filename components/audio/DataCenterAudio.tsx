'use client'

import {
  createContext, useContext, useRef, useState,
  useCallback, useEffect, ReactNode,
} from 'react'

/* ═══════════════════════════════════════════════════════════════════════════
   AUDIO TOUR SCRIPT
   7 chapters — narrated by Web Speech API
═══════════════════════════════════════════════════════════════════════════ */
export const TOUR_SEGMENTS = [
  {
    id: 'welcome',
    chapter: '01',
    title: 'Welcome to UnyKorn',
    text: `Welcome to UnyKorn. You are entering the operating system for energy and infrastructure assets. This platform was built for institutional principals, capital partners, and infrastructure operators who work at the intersection of real-world projects, energy systems, treasury execution, and AI-enabled command operations. Take a moment to orient yourself — and let this guide walk you through everything that powers the infrastructure economy.`,
  },
  {
    id: 'what-is-dc',
    chapter: '02',
    title: 'What Is a Data Center',
    text: `A data center is the physical backbone of the digital world. Inside these controlled, climate-managed facilities, thousands of servers process, store, and transmit the data that powers global banking, artificial intelligence, cloud computing, logistics, healthcare, and real-time communications. Every financial transaction, every AI inference, every message you send — runs on compute housed inside a data center. These are not tech buildings. They are critical national infrastructure.`,
  },
  {
    id: 'tiers',
    chapter: '03',
    title: 'Tier Standards and Redundancy',
    text: `Data centers are classified from Tier One through Tier Four by the Uptime Institute. Tier One provides basic infrastructure with a single power path and up to 28 hours of downtime per year. Tier Two adds component redundancy. Tier Three — the institutional standard — delivers concurrent maintainability, 99.982 percent uptime, and 1.6 hours of annual downtime maximum. Tier Four provides full fault tolerance with 99.995 percent availability — less than 26 minutes of downtime per year. Anything handling treasury, ledger operations, or financial workflows requires Tier Three or above.`,
  },
  {
    id: 'power',
    chapter: '04',
    title: 'Power, AI, and the Energy Demand',
    text: `Power is the most critical and constrained resource in data center infrastructure. Traditional enterprise servers draw 4 to 8 kilowatts per rack. Modern AI infrastructure — GPU clusters for model training and real-time inference — draws 30 to 150 kilowatts per rack. A single hyperscale AI campus may draw 500 megawatts or more — equivalent to powering a mid-sized city. This is not a technology story. This is an energy story. The facilities powering artificial intelligence are themselves among the largest energy consumers on earth. Power strategy, utility access, generation backup, and renewable integration are not secondary considerations. They are the foundational underwriting criteria.`,
  },
  {
    id: 'cooling',
    chapter: '05',
    title: 'Cooling, Efficiency, and WUE',
    text: `Cooling is the second fundamental constraint. Power Usage Effectiveness — known as PUE — measures how efficiently a data center converts total facility power into useful compute work. World-class operations achieve PUE below 1.2. For comparison, a PUE of 2.0 means half of all power drawn goes to cooling overhead alone. For AI infrastructure, air cooling is no longer sufficient. Direct liquid cooling, rear-door heat exchangers, and full immersion systems are becoming mandatory to manage the thermal density of modern GPU workloads. Water Usage Effectiveness is now a parallel reporting metric alongside PUE. The most advanced facilities close the loop on both.`,
  },
  {
    id: 'unykorn',
    chapter: '06',
    title: 'The UnyKorn Infrastructure OS',
    text: `UnyKorn is not a data center company. UnyKorn is an operating system for energy and infrastructure assets. The four functions of the platform are: Develop — intake, diligence, underwriting, and project readiness. Capitalize — SPV architecture, investor structure, compliant issuance. Settle — treasury control, milestone disbursements, distributions, and reconciliation. Command — AI monitoring, reporting, portfolio oversight, and exception handling. Data centers exist inside the UnyKorn model as both the execution backbone — the compute, control, and observability infrastructure behind every operation — and as a strategic asset class that the platform can finance, structure, and operate.`,
  },
  {
    id: 'platform',
    chapter: '07',
    title: 'The Platform and Next Steps',
    text: `On this platform, qualified principals can evaluate infrastructure assets, submit project documentation for institutional review, access UnyKorn research and capital formation frameworks, and engage directly with our team. The platform covers the full infrastructure lifecycle — from project intake and technical diligence, through structuring, settlement, digital asset issuance, and portfolio command. Documents submitted here are reviewed by UnyKorn's infrastructure and capital teams. Resources available for download include our infrastructure underwriting framework, capital stack guides, treasury integration documentation, and our AI command systems overview. Welcome to the infrastructure operating system.`,
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════════ */
export interface AudioContextValue {
  isPlaying: boolean
  isAmbientOn: boolean
  hasStarted: boolean
  currentSegment: number
  totalSegments: number
  currentTitle: string
  currentText: string
  currentChapter: string
  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  previous: () => void
  stop: () => void
  toggleAmbient: () => void
  playSegment: (idx: number) => void
}

const AudioCtx = createContext<AudioContextValue | null>(null)

const NOOP: AudioContextValue = {
  isPlaying: false, isAmbientOn: false, hasStarted: false,
  currentSegment: 0, totalSegments: TOUR_SEGMENTS.length,
  currentTitle: '', currentText: '', currentChapter: '',
  start: () => {}, pause: () => {}, resume: () => {}, skip: () => {},
  previous: () => {}, stop: () => {}, toggleAmbient: () => {}, playSegment: () => {},
}

export function useAudio(): AudioContextValue {
  const c = useContext(AudioCtx)
  return c ?? NOOP
}

/* ═══════════════════════════════════════════════════════════════════════════
   AMBIENT SYNTHESIS — Web Audio API
   Layers: 60/120/180Hz power hum + bandpass fan noise + HVAC rumble
═══════════════════════════════════════════════════════════════════════════ */
function buildAmbient(actx: AudioContext): GainNode {
  const master = actx.createGain()
  master.gain.value = 0
  master.connect(actx.destination)

  // — Power hum harmonics ———————————————————————————————
  ;[60, 120, 180, 240].forEach((freq, i) => {
    const osc = actx.createOscillator()
    const g = actx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    g.gain.value = 0.038 / (i + 1)
    osc.connect(g)
    g.connect(master)
    osc.start()
  })

  // — Server fan noise — white noise → bandpass ————————
  const makeFan = (centerFreq: number, q: number, vol: number) => {
    const bufLen = actx.sampleRate * 3
    const buf = actx.createBuffer(1, bufLen, actx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1
    const src = actx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const bp = actx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = centerFreq
    bp.Q.value = q
    const g = actx.createGain()
    g.gain.value = vol
    src.connect(bp)
    bp.connect(g)
    g.connect(master)
    src.start()
    return { bp, g }
  }

  const fan1 = makeFan(1800, 0.7, 0.052)
  const fan2 = makeFan(3200, 0.5, 0.028)

  // — HVAC low rumble ————————————————————————————————
  const bufLen2 = actx.sampleRate * 5
  const buf2 = actx.createBuffer(1, bufLen2, actx.sampleRate)
  const d2 = buf2.getChannelData(0)
  // Brown noise generation (1/f² approximation)
  let lastOut = 0
  for (let i = 0; i < bufLen2; i++) {
    const white = Math.random() * 2 - 1
    lastOut = (lastOut + 0.02 * white) / 1.02
    d2[i] = lastOut * 3.5
  }
  const hvacSrc = actx.createBufferSource()
  hvacSrc.buffer = buf2
  hvacSrc.loop = true
  const hvacLp = actx.createBiquadFilter()
  hvacLp.type = 'lowpass'
  hvacLp.frequency.value = 90
  const hvacG = actx.createGain()
  hvacG.gain.value = 0.06
  hvacSrc.connect(hvacLp)
  hvacLp.connect(hvacG)
  hvacG.connect(master)
  hvacSrc.start()

  // — LFOs for organic variation ————————————————————
  const lfo1 = actx.createOscillator()
  const lfoG1 = actx.createGain()
  lfo1.frequency.value = 0.04
  lfoG1.gain.value = 280
  lfo1.connect(lfoG1)
  lfoG1.connect(fan1.bp.frequency)
  lfo1.start()

  const lfo2 = actx.createOscillator()
  const lfoG2 = actx.createGain()
  lfo2.frequency.value = 0.07
  lfoG2.gain.value = 0.012
  lfo2.connect(lfoG2)
  lfoG2.connect(fan2.g.gain)
  lfo2.start()

  return master
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER
═══════════════════════════════════════════════════════════════════════════ */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAmbientOn, setIsAmbientOn] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentSegment, setCurrentSegment] = useState(0)

  const actxRef = useRef<AudioContext | null>(null)
  const ambientRef = useRef<GainNode | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // ── Init AudioContext on first user gesture ─────────────────────────────
  const ensureContext = useCallback(() => {
    if (!actxRef.current) {
      actxRef.current = new AudioContext()
      ambientRef.current = buildAmbient(actxRef.current)
    }
    if (actxRef.current.state === 'suspended') {
      actxRef.current.resume()
    }
  }, [])

  // ── Start ambient fade-in ───────────────────────────────────────────────
  const startAmbient = useCallback(() => {
    ensureContext()
    if (!ambientRef.current || !actxRef.current) return
    const now = actxRef.current.currentTime
    ambientRef.current.gain.cancelScheduledValues(now)
    ambientRef.current.gain.setValueAtTime(ambientRef.current.gain.value, now)
    ambientRef.current.gain.linearRampToValueAtTime(0.38, now + 3.5)
    setIsAmbientOn(true)
  }, [ensureContext])

  // ── Stop ambient fade-out ───────────────────────────────────────────────
  const stopAmbient = useCallback(() => {
    if (!ambientRef.current || !actxRef.current) return
    const now = actxRef.current.currentTime
    ambientRef.current.gain.cancelScheduledValues(now)
    ambientRef.current.gain.setValueAtTime(ambientRef.current.gain.value, now)
    ambientRef.current.gain.linearRampToValueAtTime(0, now + 2)
    setIsAmbientOn(false)
  }, [])

  // ── Speak a segment via SpeechSynthesis ────────────────────────────────
  const speakSegment = useCallback((idx: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const seg = TOUR_SEGMENTS[idx]
    if (!seg) return

    const utter = new SpeechSynthesisUtterance(seg.text)
    utter.rate = 0.88
    utter.pitch = 0.94
    utter.volume = 1

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = [
      'Google UK English Male',
      'Microsoft David',
      'Google US English',
      'Microsoft Mark',
      'Alex',
      'en-US',
    ]
    for (const name of preferred) {
      const v = voices.find(
        v => v.name.includes(name) || v.lang.includes(name)
      )
      if (v) { utter.voice = v; break }
    }

    utter.onend = () => {
      const next = idx + 1
      if (next < TOUR_SEGMENTS.length) {
        setCurrentSegment(next)
        speakSegment(next)
      } else {
        setIsPlaying(false)
        setCurrentSegment(0)
      }
    }
    utter.onerror = () => setIsPlaying(false)

    synthRef.current = utter
    window.speechSynthesis.speak(utter)
    setIsPlaying(true)
    setCurrentSegment(idx)
  }, [])

  // ── Public API ──────────────────────────────────────────────────────────
  const start = useCallback(() => {
    ensureContext()
    startAmbient()
    speakSegment(0)
    setHasStarted(true)
  }, [ensureContext, startAmbient, speakSegment])

  const pause = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis?.pause()
    setIsPlaying(false)
  }, [])

  const resume = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis?.resume()
    setIsPlaying(true)
  }, [])

  const skip = useCallback(() => {
    const next = (currentSegment + 1) % TOUR_SEGMENTS.length
    speakSegment(next)
  }, [currentSegment, speakSegment])

  const previous = useCallback(() => {
    const prev = Math.max(0, currentSegment - 1)
    speakSegment(prev)
  }, [currentSegment, speakSegment])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    stopAmbient()
    setIsPlaying(false)
    setHasStarted(false)
    setCurrentSegment(0)
  }, [stopAmbient])

  const toggleAmbient = useCallback(() => {
    if (isAmbientOn) stopAmbient()
    else startAmbient()
  }, [isAmbientOn, startAmbient, stopAmbient])

  const playSegment = useCallback((idx: number) => {
    speakSegment(idx)
  }, [speakSegment])

  // ── Load voices async ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', () => {
      window.speechSynthesis?.getVoices()
    })
  }, [])

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
      actxRef.current?.close()
    }
  }, [])

  const seg = TOUR_SEGMENTS[currentSegment]

  return (
    <AudioCtx.Provider value={{
      isPlaying,
      isAmbientOn,
      hasStarted,
      currentSegment,
      totalSegments: TOUR_SEGMENTS.length,
      currentTitle: seg?.title ?? '',
      currentText: seg?.text ?? '',
      currentChapter: seg?.chapter ?? '01',
      start,
      pause,
      resume,
      skip,
      previous,
      stop,
      toggleAmbient,
      playSegment,
    }}>
      {children}
    </AudioCtx.Provider>
  )
}
