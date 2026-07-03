'use client'

import { useRef } from 'react'

const REPLAY_DELAY_MS = 30000

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  function handleEnded() {
    setTimeout(() => {
      videoRef.current?.play()
    }, REPLAY_DELAY_MS)
  }

  return (
    <video
      ref={videoRef}
      src="/hero-video.mp4"
      className="hero-video-bg"
      autoPlay
      muted
      playsInline
      onEnded={handleEnded}
      aria-hidden="true"
    />
  )
}
