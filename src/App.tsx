import { useEffect, useRef, useState } from 'react'
import { Globe, ArrowRight, Instagram, Twitter } from 'lucide-react'
import ParticleField from './ParticleField'

const FADE_MS = 500
const FADE_TRIGGER_SECONDS = 0.55

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number | null>(null)
  const fadingOutRef = useRef(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const cancelFrame = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    const fadeTo = (target: number, duration: number, onDone?: () => void) => {
      cancelFrame()
      const start = performance.now()
      const startOpacity = parseFloat(video.style.opacity || '1')

      const step = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        video.style.opacity = String(startOpacity + (target - startOpacity) * progress)
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step)
        } else {
          rafRef.current = null
          onDone?.()
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }

    const handlePlay = () => {
      fadingOutRef.current = false
      fadeTo(1, FADE_MS)
    }

    const handleTimeUpdate = () => {
      if (fadingOutRef.current) return
      if (video.duration && video.duration - video.currentTime <= FADE_TRIGGER_SECONDS) {
        fadingOutRef.current = true
        fadeTo(0, FADE_MS)
      }
    }

    const handleEnded = () => {
      video.style.opacity = '0'
      setTimeout(() => {
        video.currentTime = 0
        video.play()
      }, 100)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    video.style.opacity = '0'
    video.play().catch(() => {
      // Autoplay can be blocked until user interaction on some mobile browsers;
      // the video will start on the first touch/click via the play() retry below.
      const retry = () => {
        video.play()
        document.removeEventListener('touchstart', retry)
        document.removeEventListener('click', retry)
      }
      document.addEventListener('touchstart', retry, { once: true })
      document.addEventListener('click', retry, { once: true })
    })

    return () => {
      cancelFrame()
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex flex-col">
      {/* Background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
        style={{ opacity: 0 }}
        src="/bg.mp4"
        muted
        playsInline
        preload="auto"
      />

      {/* Ambient particle atmosphere */}
      <ParticleField />

      {/* Dark overlay for text legibility on mobile */}
      <div className="absolute inset-0 z-[6] bg-black/10 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-20 pl-4 pr-4 sm:pl-6 sm:pr-6 py-4 sm:py-6 safe-top">
        <div className="liquid-glass rounded-full px-4 sm:px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Globe size={24} className="text-white" />
              <span className="text-white font-semibold text-lg">Asme</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Features</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Pricing</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</a>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="text-white text-sm font-medium">Sign Up</button>
            <button className="liquid-glass rounded-full px-4 sm:px-6 py-2 text-white text-sm font-medium">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[10%] md:-translate-y-[20%]">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        <div className="max-w-xl w-full space-y-4">
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-base min-w-0"
            />
            <button
              aria-label="Subscribe"
              className="bg-white rounded-full p-3 text-black flex-shrink-0"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <p className="text-white text-sm leading-relaxed px-4">
            Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.
          </p>

          <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
            Manifesto
          </button>
        </div>
      </div>

      {/* Social icons */}
      <div className="relative z-10 flex justify-center gap-4 pb-8 sm:pb-12 safe-bottom">
        <button aria-label="Instagram" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <Instagram size={20} />
        </button>
        <button aria-label="Twitter" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <Twitter size={20} />
        </button>
        <button aria-label="Website" className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
          <Globe size={20} />
        </button>
      </div>
    </div>
  )
}
