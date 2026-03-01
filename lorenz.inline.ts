// Lorenz attractor background animation

const SIGMA = 10
const RHO = 28
const BETA = 8 / 3
const DT = 0.005
const TRAIL_LENGTH = 2000
const NUM_PARTICLES = 3

// Halvorsen attractor constants
const HALVORSEN_A = 1.4
const DT_HALVORSEN = 0.005

interface Particle {
  x: number
  y: number
  z: number
  trail: { x: number; y: number; z: number }[]
}

function initParticle(offset = 0): Particle {
  return {
    x: 0.1 + offset * 0.3,
    y: 0.1 + offset * 0.2,
    z: 0.1 + offset * 0.4,
    trail: [],
  }
}

function initHalvorsen(offset = 0): Particle {
  return {
    x: -5 + offset * 0.5,
    y: 0.1 + offset * 0.3,
    z: 0.1 + offset * 0.2,
    trail: [],
  }
}

function stepLorenz(p: Particle): void {
  const dx = SIGMA * (p.y - p.x)
  const dy = p.x * (RHO - p.z) - p.y
  const dz = p.x * p.y - BETA * p.z

  p.trail.push({ x: p.x, y: p.y, z: p.z })
  if (p.trail.length > TRAIL_LENGTH) p.trail.shift()

  p.x += dx * DT
  p.y += dy * DT
  p.z += dz * DT
}

function stepHalvorsen(p: Particle): void {
  const dx = -HALVORSEN_A * p.x - 4 * p.y - 4 * p.z - p.y * p.y
  const dy = -HALVORSEN_A * p.y - 4 * p.z - 4 * p.x - p.z * p.z
  const dz = -HALVORSEN_A * p.z - 4 * p.x - 4 * p.y - p.x * p.x

  p.trail.push({ x: p.x, y: p.y, z: p.z })
  if (p.trail.length > TRAIL_LENGTH) p.trail.shift()

  p.x += dx * DT_HALVORSEN
  p.y += dy * DT_HALVORSEN
  p.z += dz * DT_HALVORSEN
}

// Project 3D attractor point to 2D canvas coords
function project(
  x: number,
  y: number,
  z: number,
  cx: number,
  cy: number,
  scale: number,
  rotX: number,
  rotZ: number,
  czOffset = 25,
): [number, number] {
  // Rotate around Y axis (rotZ) and X axis (rotX)
  const cosZ = Math.cos(rotZ)
  const sinZ = Math.sin(rotZ)
  const cosX = Math.cos(rotX)
  const sinX = Math.sin(rotX)

  // Center the attractor (Lorenz ~25 on z-axis; Halvorsen centered at 0)
  const cx3 = x
  const cy3 = y
  const cz3 = z - czOffset

  // Rotate around Z
  const rx = cx3 * cosZ - cy3 * sinZ
  const ry = cx3 * sinZ + cy3 * cosZ
  const rz = cz3

  // Rotate around X
  const fx = rx
  const fy = ry * cosX - rz * sinX

  return [cx + fx * scale, cy + fy * scale]
}

function getColor(isDark: boolean): [string, string, string] {
  // Returns [color1, color2, color3] for the 3 particles
  if (isDark) {
    return ["#7b97aa", "#84a59d", "#a59d84"]
  } else {
    return ["#284b63", "#84a59d", "#6b4c63"]
  }
}

function setupCanvas(): HTMLCanvasElement {
  const existing = document.getElementById("lorenz-canvas") as HTMLCanvasElement | null
  if (existing) return existing

  const canvas = document.createElement("canvas")
  canvas.id = "lorenz-canvas"
  canvas.style.position = "fixed"
  canvas.style.top = "0"
  canvas.style.left = "0"
  canvas.style.width = "100%"
  canvas.style.height = "100%"
  canvas.style.pointerEvents = "none"
  canvas.style.zIndex = "-1"
  canvas.style.opacity = "0.18"
  document.body.prepend(canvas)
  return canvas
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function isDarkMode(): boolean {
  return document.documentElement.getAttribute("saved-theme") === "dark"
}

function startLorenz(): void {
  const canvas = setupCanvas()
  resizeCanvas(canvas)

  const ctx = canvas.getContext("2d")!

  // Main (center) attractor
  const particles: Particle[] = Array.from({ length: NUM_PARTICLES }, (_, i) => initParticle(i))

  // Left side attractor — Halvorsen curve
  const particlesLeft: Particle[] = Array.from({ length: NUM_PARTICLES }, (_, i) =>
    initHalvorsen(i),
  )

  // Right side attractor — Halvorsen curve (different initial conditions)
  const particlesRight: Particle[] = Array.from({ length: NUM_PARTICLES }, (_, i) =>
    initHalvorsen(i + 3),
  )

  // Rotate slowly over time; side attractors are phase-shifted so they look distinct
  let rotZ = Math.random() * Math.PI * 2
  let rotZLeft = Math.random() * Math.PI * 2
  let rotZRight = Math.random() * Math.PI * 2

  // Warm-up: run 5000 steps so the attractors are already in their strange-attractor shapes
  for (let i = 0; i < 5000; i++) {
    particles.forEach(stepLorenz)
    particlesLeft.forEach(stepHalvorsen)
    particlesRight.forEach(stepHalvorsen)
  }

  // Clear trails so curves grow in from scratch visually
  ;[...particles, ...particlesLeft, ...particlesRight].forEach((p) => (p.trail = []))

  let lastResize = 0
  window.addEventListener("resize", () => {
    const now = Date.now()
    if (now - lastResize > 200) {
      lastResize = now
      resizeCanvas(canvas)
    }
  })

  let frameId: number

  function draw(): void {
    const W = canvas.width
    const H = canvas.height
    const scale = Math.min(W, H) / 55

    const isDark = isDarkMode()
    const colors = getColor(isDark)

    // Fade the canvas each frame for trail effect
    ctx.fillStyle = isDark ? "rgba(22,22,24,0.04)" : "rgba(250,248,248,0.04)"
    ctx.fillRect(0, 0, W, H)

    rotZ += 0.0003
    rotZLeft += 0.0003
    rotZRight += 0.0003

    // Step multiple times per frame for speed
    for (let s = 0; s < 5; s++) {
      particles.forEach(stepLorenz)
      particlesLeft.forEach(stepHalvorsen)
      particlesRight.forEach(stepHalvorsen)
    }

    // Helper to draw one attractor at a given center and scale
    function drawAttractor(pts: Particle[], cx: number, cy: number, sc: number, rZ: number, dotR: number, lw: number, czOffset = 25): void {
      pts.forEach((p, i) => {
        const [px, py] = project(p.x, p.y, p.z, cx, cy, sc, 0.6, rZ, czOffset)
        ctx.beginPath()
        ctx.arc(px, py, dotR, 0, Math.PI * 2)
        ctx.fillStyle = colors[i % colors.length]
        ctx.fill()

        const trail = p.trail
        const trailLen = trail.length
        const drawEvery = 2
        for (let j = drawEvery; j < trailLen; j += drawEvery) {
          const alpha = (j / trailLen) * 0.6
          const [tx, ty] = project(trail[j].x, trail[j].y, trail[j].z, cx, cy, sc, 0.6, rZ, czOffset)
          const [px2, py2] = project(trail[j - drawEvery].x, trail[j - drawEvery].y, trail[j - drawEvery].z, cx, cy, sc, 0.6, rZ, czOffset)
          ctx.beginPath()
          ctx.moveTo(px2, py2)
          ctx.lineTo(tx, ty)
          ctx.strokeStyle =
            colors[i % colors.length] +
            Math.floor(alpha * 255)
              .toString(16)
              .padStart(2, "0")
          ctx.lineWidth = lw
          ctx.stroke()
        }
      })
    }

    // Main center attractor (full size)
    drawAttractor(particles, W / 2, H / 2, scale, rotZ, 1.5, 0.8)

    // Side attractors — Halvorsen curves (~55 % of main scale, tucked into the left/right thirds)
    const sideScale = scale * 0.75
    drawAttractor(particlesLeft, W * 0.12, H / 2, sideScale, rotZLeft, 1.0, 0.55, 0)
    drawAttractor(particlesRight, W * 0.88, H / 2, sideScale, rotZRight, 1.0, 0.55, 0)

    frameId = requestAnimationFrame(draw)
  }

  draw()

  // Clean up on SPA navigation to re-init
  document.addEventListener("nav", () => {
    cancelAnimationFrame(frameId)
    // Canvas persists since it's in body; just restart
    const c = document.getElementById("lorenz-canvas") as HTMLCanvasElement | null
    if (!c) {
      startLorenz()
    } else {
      frameId = requestAnimationFrame(draw)
    }
  })
}

startLorenz()
