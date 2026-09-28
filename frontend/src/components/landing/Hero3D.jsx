import React, { useEffect, useRef } from "react"
import * as THREE from "three"

/**
 * Hero3D - Sophisticated 3D Financial Risk & Market Intelligence Engine
 * Built with Three.js WebGL:
 * - Floating geodesic risk manifold with glowing interconnected nodes
 * - Treasury currency nodes (USD, EUR, GBP, JPY) and risk metrics
 * - Animated data flow conduits with traveling pulse signals
 * - Ambient financial particle constellation
 * - Interactive mouse parallax with inertia & damping
 * - Full prefers-reduced-motion support & automatic RAF cleanup
 */
export function Hero3D() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. Accessibility Check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // 2. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene()

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 24)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // 3. Lighting (Atmospheric Enterprise Dark/Blue)
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5)
    scene.add(ambientLight)

    const primaryLight = new THREE.PointLight(0x3b82f6, 4, 50)
    primaryLight.position.set(10, 10, 15)
    scene.add(primaryLight)

    const secondaryLight = new THREE.PointLight(0x1d4ed8, 3, 40)
    secondaryLight.position.set(-12, -8, 10)
    scene.add(secondaryLight)

    const coreLight = new THREE.PointLight(0x60a5fa, 2, 20)
    coreLight.position.set(0, 0, 0)
    scene.add(coreLight)

    // Root visualization group for master rotation & tilt
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // 4. Central Financial Risk Sphere (Geodesic Wireframe + Inner Core)
    const sphereRadius = 5.2

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(sphereRadius * 0.72, 32, 32)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x050d24,
      emissive: 0x0d2847,
      roughness: 0.4,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    })
    const innerCore = new THREE.Mesh(innerGeo, innerMat)
    rootGroup.add(innerCore)

    // Geodesic Wireframe Overlay (Icosahedron based)
    const icoGeo = new THREE.IcosahedronGeometry(sphereRadius, 2)
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    })
    const wireframeMesh = new THREE.Mesh(icoGeo, wireframeMat)
    rootGroup.add(wireframeMesh)

    // Secondary subtle outer ring/orbit
    const ringGeo = new THREE.RingGeometry(sphereRadius * 1.35, sphereRadius * 1.36, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    })
    const orbitRing = new THREE.Mesh(ringGeo, ringMat)
    orbitRing.rotation.x = Math.PI * 0.42
    orbitRing.rotation.y = Math.PI * 0.15
    rootGroup.add(orbitRing)

    const ringGeo2 = new THREE.RingGeometry(sphereRadius * 1.5, sphereRadius * 1.508, 64)
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    })
    const orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2)
    orbitRing2.rotation.x = -Math.PI * 0.35
    orbitRing2.rotation.y = Math.PI * 0.25
    rootGroup.add(orbitRing2)

    // 5. Interconnected Risk Vertices & Glowing Nodes
    const nodePositions = []
    const posAttribute = icoGeo.attributes.position
    const totalVertices = posAttribute.count

    // Sample distinct node points
    const sampledIndices = [0, 4, 8, 15, 22, 28, 35, 42, 50, 60, 72, 85]
    const nodeGeo = new THREE.SphereGeometry(0.16, 16, 16)
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x3b82f6,
      emissiveIntensity: 2.5,
      roughness: 0.1,
    })

    const nodeInstMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, sampledIndices.length)
    const dummy = new THREE.Object3D()

    sampledIndices.forEach((idx, i) => {
      const x = posAttribute.getX(idx % totalVertices)
      const y = posAttribute.getY(idx % totalVertices)
      const z = posAttribute.getZ(idx % totalVertices)
      dummy.position.set(x, y, z)
      dummy.scale.set(1.2, 1.2, 1.2)
      dummy.updateMatrix()
      nodeInstMesh.setMatrixAt(i, dummy.matrix)
      nodePositions.push(new THREE.Vector3(x, y, z))
    })
    nodeInstMesh.instanceMatrix.needsUpdate = true
    rootGroup.add(nodeInstMesh)

    // 6. Dynamic Financial Risk Conduits (Bezier Curves with Traveling Pulses)
    const conduitCurves = []
    const pulseObjects = []

    const pulseGeo = new THREE.SphereGeometry(0.12, 12, 12)
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.95,
    })

    for (let i = 0; i < nodePositions.length; i += 2) {
      if (i + 1 < nodePositions.length) {
        const p1 = nodePositions[i]
        const p2 = nodePositions[i + 1]
        // Midpoint pushed slightly outward for curved financial trajectory
        const mid = new THREE.Vector3()
          .addVectors(p1, p2)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(sphereRadius * 1.22)

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2)
        conduitCurves.push(curve)

        // Visual curve line
        const points = curve.getPoints(32)
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.45,
        })
        const curveLine = new THREE.Line(lineGeo, lineMat)
        rootGroup.add(curveLine)

        // Traveling pulse node
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat)
        rootGroup.add(pulseMesh)
        pulseObjects.push({
          mesh: pulseMesh,
          curve,
          speed: 0.003 + (i % 3) * 0.0015,
          progress: (i / nodePositions.length) % 1,
        })
      }
    }

    // 7. Floating 3D Financial Badges (Canvas Sprites)
    // Tickers & metrics that represent enterprise financial intelligence
    const financialBadges = [
      { text: "$ USD · 44.2%", subtitle: "Net Long Exposure", x: 4.8, y: 3.2, z: 2.2, color: "#3B82F6" },
      { text: "€ EUR · 28.5%", subtitle: "Hedge Ratio 88%", x: -5.4, y: 2.4, z: 1.8, color: "#60A5FA" },
      { text: "£ GBP · 14.1%", subtitle: "VaR (99%): $420K", x: 4.2, y: -3.6, z: 2.6, color: "#38BDF8" },
      { text: "¥ JPY · 13.2%", subtitle: "Vol Spread -1.8%", x: -4.6, y: -3.2, z: 1.6, color: "#818CF8" },
      { text: "PORTFOLIO VaR", subtitle: "99.2% Conf · $1.42M", x: 0.2, y: 5.8, z: -1.2, color: "#3B82F6" },
      { text: "RISK INDEX: 34", subtitle: "Optimal Risk Corridor", x: -0.5, y: -5.6, z: 0.8, color: "#10B981" },
    ]

    function createBadgeTexture(badge) {
      const canvas = document.createElement("canvas")
      canvas.width = 380
      canvas.height = 120
      const ctx = canvas.getContext("2d")

      // Background pill
      ctx.fillStyle = "rgba(6, 14, 34, 0.82)"
      ctx.beginPath()
      ctx.roundRect(4, 4, 372, 112, 16)
      ctx.fill()

      // Border
      ctx.strokeStyle = "rgba(59, 130, 246, 0.45)"
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Accent dot
      ctx.fillStyle = badge.color
      ctx.beginPath()
      ctx.arc(36, 44, 8, 0, Math.PI * 2)
      ctx.fill()

      // Glow effect around dot
      ctx.fillStyle = "rgba(59, 130, 246, 0.25)"
      ctx.beginPath()
      ctx.arc(36, 44, 15, 0, Math.PI * 2)
      ctx.fill()

      // Title text
      ctx.fillStyle = "#F8FAFC"
      ctx.font = "bold 26px Inter, system-ui, sans-serif"
      ctx.fillText(badge.text, 58, 52)

      // Subtitle text
      ctx.fillStyle = "#94A3B8"
      ctx.font = "500 20px Inter, system-ui, sans-serif"
      ctx.fillText(badge.subtitle, 58, 88)

      const texture = new THREE.CanvasTexture(canvas)
      texture.minFilter = THREE.LinearFilter
      return texture
    }

    const badgeSprites = []
    financialBadges.forEach((badge) => {
      const texture = createBadgeTexture(badge)
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.position.set(badge.x, badge.y, badge.z)
      sprite.scale.set(3.4, 1.08, 1)
      rootGroup.add(sprite)
      badgeSprites.push({
        sprite,
        basePos: new THREE.Vector3(badge.x, badge.y, badge.z),
        phase: Math.random() * Math.PI * 2,
      })
    })

    // 8. Ambient Particle Constellation (Financial Data Dust)
    const particleCount = 120
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      const dist = 7 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      particlePositions[i] = dist * Math.sin(phi) * Math.cos(theta)
      particlePositions[i + 1] = dist * Math.sin(phi) * Math.sin(theta)
      particlePositions[i + 2] = dist * Math.cos(phi)
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.16,
      transparent: true,
      opacity: 0.65,
    })
    const particleSystem = new THREE.Points(particleGeo, particleMat)
    rootGroup.add(particleSystem)

    // 9. Interactive Mouse Parallax Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      const clientX = e.clientX - rect.left
      const clientY = e.clientY - rect.top

      mouse.targetX = (clientX / rect.width) * 2 - 1
      mouse.targetY = -(clientY / rect.height) * 2 + 1
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })

    // 10. Animation Loop
    let animationFrameId
    let isVisible = true
    const startTime = performance.now()
    let lastTime = performance.now()

    const handleVisibilityChange = () => {
      isVisible = !document.hidden
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (!isVisible) return

      const now = performance.now()
      const delta = (now - lastTime) * 0.001
      lastTime = now
      const elapsedTime = (now - startTime) * 0.001

      // Smooth mouse interpolation (damping)
      mouse.x += (mouse.targetX - mouse.x) * 0.045
      mouse.y += (mouse.targetY - mouse.y) * 0.045

      // Subtle camera parallax
      camera.position.x = mouse.x * 2.2
      camera.position.y = mouse.y * 1.8
      camera.lookAt(0, 0, 0)

      if (!prefersReducedMotion) {
        // Slow, elegant continuous rotation of the financial risk engine
        rootGroup.rotation.y += 0.0028
        rootGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.08

        // Counter-rotation of orbits
        orbitRing.rotation.z -= 0.003
        orbitRing2.rotation.z += 0.002

        // Traveling pulse packets along risk conduits
        pulseObjects.forEach((p) => {
          p.progress = (p.progress + p.speed) % 1
          const pt = p.curve.getPointAt(p.progress)
          p.mesh.position.copy(pt)
        })

        // Gentle floating oscillation of 3D data badges
        badgeSprites.forEach((item) => {
          item.sprite.position.y = item.basePos.y + Math.sin(elapsedTime * 1.2 + item.phase) * 0.15
          item.sprite.position.x = item.basePos.x + Math.cos(elapsedTime * 0.8 + item.phase) * 0.08
        })

        // Subtle particle drift
        particleSystem.rotation.y = elapsedTime * 0.015
      }

      renderer.render(scene, camera)
    }

    animate()

    // 11. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight

      // Adjust camera distance for mobile/smaller screens
      if (newWidth < 768) {
        camera.position.z = 32
      } else if (newWidth < 1024) {
        camera.position.z = 28
      } else {
        camera.position.z = 24
      }

      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener("resize", handleResize, { passive: true })
    handleResize()

    // 12. Cleanup on Unmount
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      cancelAnimationFrame(animationFrameId)

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }

      // Memory disposal
      renderer.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      icoGeo.dispose()
      wireframeMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      ringGeo2.dispose()
      ringMat2.dispose()
      nodeGeo.dispose()
      nodeMat.dispose()
      pulseGeo.dispose()
      pulseMat.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      badgeSprites.forEach((b) => {
        if (b.sprite.material.map) b.sprite.material.map.dispose()
        b.sprite.material.dispose()
      })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] sm:min-h-[500px] lg:min-h-[640px] flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    />
  )
}

export default Hero3D
