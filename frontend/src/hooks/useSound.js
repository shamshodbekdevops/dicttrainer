import { useCallback, useEffect, useRef, useState } from "react"

const SOUND_KEY = "vt_sound_enabled"

function getAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) {
    return null
  }
  return new AudioCtx()
}

function playTone(ctx, frequency, durationMs, type = "sine", volume = 0.12, startOffset = 0) {
  const now = ctx.currentTime + startOffset
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + durationMs / 1000)
}

export function useSoundToggle() {
  const [enabled, setEnabled] = useState(() => {
    const raw = localStorage.getItem(SOUND_KEY)
    if (raw === null) {
      localStorage.setItem(SOUND_KEY, "true")
      return true
    }
    return raw === "true"
  })

  const ctxRef = useRef(null)

  const unlockAudio = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = getAudioContext()
    }
    if (ctxRef.current && ctxRef.current.state === "suspended") {
      try {
        await ctxRef.current.resume()
      } catch (_err) {
        // Ignore; next interaction will retry resume.
      }
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      unlockAudio()
    }

    window.addEventListener("pointerdown", handler, { once: true })
    window.addEventListener("keydown", handler, { once: true })

    return () => {
      window.removeEventListener("pointerdown", handler)
      window.removeEventListener("keydown", handler)
    }
  }, [unlockAudio])

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
      }
    }
  }, [])

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev
      localStorage.setItem(SOUND_KEY, String(next))
      return next
    })
    unlockAudio()
  }

  const playSuccess = async () => {
    if (!enabled) {
      return
    }
    await unlockAudio()
    if (!ctxRef.current) {
      return
    }
    playTone(ctxRef.current, 700, 140, "triangle", 0.12, 0)
    playTone(ctxRef.current, 920, 140, "triangle", 0.1, 0.08)
  }

  const playFail = async () => {
    if (!enabled) {
      return
    }
    await unlockAudio()
    if (!ctxRef.current) {
      return
    }
    playTone(ctxRef.current, 260, 220, "sawtooth", 0.13, 0)
  }

  return {
    enabled,
    toggle,
    playSuccess,
    playFail,
  }
}
