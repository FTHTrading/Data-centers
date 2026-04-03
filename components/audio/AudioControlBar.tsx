'use client'

import { useState } from 'react'
import { useAudio, TOUR_SEGMENTS } from './DataCenterAudio'
import {
  Play, Pause, SkipForward, SkipBack, Volume2,
  VolumeX, X, ChevronUp, ChevronDown, Headphones,
} from 'lucide-react'

export function AudioControlBar() {
  const {
    isPlaying, isAmbientOn, hasStarted, currentSegment,
    totalSegments, currentTitle, currentChapter,
    start, pause, resume, skip, previous, stop, toggleAmbient, playSegment,
  } = useAudio()

  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  // ── Collapsed invite pill (before start) ───────────────────────────────
  if (!hasStarted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button
          onClick={start}
          className="audio-start-btn group flex items-center gap-3 px-5 py-3 rounded-2xl"
        >
          <span className="audio-pulse-ring" />
          <Headphones size={16} className="text-blue-300 group-hover:text-white transition-colors" />
          <div className="text-left">
            <div className="text-xs font-semibold text-white leading-tight">Start Audio Tour</div>
            <div className="text-[10px] text-blue-300/70 leading-tight">7 chapters · guided narration</div>
          </div>
          <Play size={12} className="text-blue-400 ml-1" />
        </button>
      </div>
    )
  }

  // ── Active control bar ──────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Chapter list panel */}
      {expanded && (
        <div className="audio-chapter-panel mb-1 w-72 rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.08]">
            <span className="text-[10px] uppercase tracking-widest text-[#4a5068]">Audio Tour</span>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {TOUR_SEGMENTS.map((seg, i) => (
              <button
                key={seg.id}
                onClick={() => playSegment(i)}
                className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors
                  ${i === currentSegment
                    ? 'bg-blue-500/15 text-blue-300'
                    : 'text-[#7c8494] hover:bg-white/[0.04] hover:text-white'}`}
              >
                <span className="text-[9px] font-mono tracking-wider opacity-60 w-5 flex-shrink-0">
                  {seg.chapter}
                </span>
                <span className="text-xs font-medium leading-tight">{seg.title}</span>
                {i === currentSegment && isPlaying && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 audio-playing-dot flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main control pill */}
      <div className="audio-bar flex items-center gap-1 px-3 py-2 rounded-2xl">

        {/* Chapter info */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2.5 pr-2 hover:opacity-80 transition-opacity min-w-0"
        >
          <span className="text-[9px] font-mono text-blue-400 tracking-widest border border-blue-500/30 px-1.5 py-0.5 rounded">
            {currentChapter}
          </span>
          <span className="text-xs text-[#c8d3e0] truncate max-w-[120px]">{currentTitle}</span>
          {expanded
            ? <ChevronDown size={11} className="text-[#4a5068] flex-shrink-0" />
            : <ChevronUp size={11} className="text-[#4a5068] flex-shrink-0" />}
        </button>

        <div className="w-px h-4 bg-white/[0.08] mx-1" />

        {/* Transport controls */}
        <button onClick={previous} className="audio-btn" title="Previous chapter">
          <SkipBack size={13} />
        </button>

        <button
          onClick={isPlaying ? pause : resume}
          className="audio-btn-primary"
          title={isPlaying ? 'Pause' : 'Resume'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        </button>

        <button onClick={skip} className="audio-btn" title="Next chapter">
          <SkipForward size={13} />
        </button>

        <div className="w-px h-4 bg-white/[0.08] mx-1" />

        {/* Ambient toggle */}
        <button
          onClick={toggleAmbient}
          title={isAmbientOn ? 'Mute ambient' : 'Enable ambient sound'}
          className={`audio-btn ${isAmbientOn ? 'text-blue-400' : 'text-[#4a5068]'}`}
        >
          {isAmbientOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        {/* Progress dots */}
        <div className="flex gap-0.5 ml-1">
          {TOUR_SEGMENTS.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all ${
                i === currentSegment
                  ? 'w-3 h-1.5 bg-blue-400'
                  : i < currentSegment
                  ? 'w-1.5 h-1.5 bg-blue-600/40'
                  : 'w-1.5 h-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>

        <button
          onClick={stop}
          className="audio-btn ml-1 text-[#4a5068] hover:text-[#ef4444]"
          title="Stop tour"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
