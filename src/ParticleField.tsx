import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Subtle floating dust/particle layer rendered with three.js.
 * Sits between the background video and the glass UI, blended with
 * `mix-blend-screen` so it reads as cinematic atmosphere rather than
 * a distinct visual layer. Tuned to be light on mobile GPUs.
 */
export default function ParticleField() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const isMobile = window.innerWidth < 768
    const particleCount = isMobile ? 90 : 220

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    )
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // Particle geometry: soft points drifting slowly in a loose volume
    const positions = new Float32Array(particleCount * 3)
    const speeds = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6
      speeds[i] = 0.05 + Math.random() * 0.12
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Circular soft sprite drawn on a small canvas, used as the point texture
    const spriteCanvas = document.createElement('canvas')
    spriteCanvas.width = 64
    spriteCanvas.height = 64
    const ctx = spriteCanvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const spriteTexture = new THREE.CanvasTexture(spriteCanvas)

    const material = new THREE.PointsMaterial({
      size: 0.09,
      map: spriteTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let frameId: number
    let visible = true
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      if (!visible) return
      const t = clock.getElapsedTime()
      const posAttr = geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3
        posAttr.array[idx + 1] += speeds[i] * 0.01
        posAttr.array[idx] += Math.sin(t * 0.2 + i) * 0.0015
        if (posAttr.array[idx + 1] > 4.5) posAttr.array[idx + 1] = -4.5
      }
      posAttr.needsUpdate = true
      points.rotation.y = t * 0.01
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Pause the render loop when the tab is hidden to save battery on mobile
    const handleVisibility = () => {
      visible = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      geometry.dispose()
      material.dispose()
      spriteTexture.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-[5] pointer-events-none mix-blend-screen"
      aria-hidden="true"
    />
  )
}
