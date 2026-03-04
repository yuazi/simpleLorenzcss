// Lorenz attractor background animation

// ── Mutable parameters (live-updated via settings panel) ──────────────────────
let lorenzSigma = 10
let lorenzRho = 28
let lorenzBeta = 8 / 3
let lorenzDt = 0.005
let lorenzTrailLength = 2000
let lorenzNumParticles = 3

let halvorsenA = 1.4
let halvorsenDt = 0.005
let halvorsenTrailLength = 2000
let halvorsenNumParticles = 3

// ── Types ─────────────────────────────────────────────────────────────────────
interface Particle {
  x: number
  y: number
  z: number
  trail: { x: number; y: number; z: number }[]
}

// ── Particle factories ────────────────────────────────────────────────────────
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

// ── Step functions (use live parameter variables) ─────────────────────────────
function stepLorenz(p: Particle): void {
  const dx = lorenzSigma * (p.y - p.x)
  const dy = p.x * (lorenzRho - p.z) - p.y
  const dz = p.x * p.y - lorenzBeta * p.z

  p.trail.push({ x: p.x, y: p.y, z: p.z })
  if (p.trail.length > lorenzTrailLength) p.trail.shift()

  p.x += dx * lorenzDt
  p.y += dy * lorenzDt
  p.z += dz * lorenzDt
}

function stepHalvorsen(p: Particle): void {
  const dx = -halvorsenA * p.x - 4 * p.y - 4 * p.z - p.y * p.y
  const dy = -halvorsenA * p.y - 4 * p.z - 4 * p.x - p.z * p.z
  const dz = -halvorsenA * p.z - 4 * p.x - 4 * p.y - p.x * p.x

  p.trail.push({ x: p.x, y: p.y, z: p.z })
  if (p.trail.length > halvorsenTrailLength) p.trail.shift()

  p.x += dx * halvorsenDt
  p.y += dy * halvorsenDt
  p.z += dz * halvorsenDt
}

// ── Projection ────────────────────────────────────────────────────────────────
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
  const cosZ = Math.cos(rotZ)
  const sinZ = Math.sin(rotZ)
  const cosX = Math.cos(rotX)
  const sinX = Math.sin(rotX)

  const cx3 = x
  const cy3 = y
  const cz3 = z - czOffset

  const rx = cx3 * cosZ - cy3 * sinZ
  const ry = cx3 * sinZ + cy3 * cosZ
  const rz = cz3

  const fx = rx
  const fy = ry * cosX - rz * sinX

  return [cx + fx * scale, cy + fy * scale]
}

function getColor(isDark: boolean): [string, string, string] {
  if (isDark) {
    return ["#7b97aa", "#84a59d", "#a59d84"]
  } else {
    return ["#284b63", "#84a59d", "#6b4c63"]
  }
}

// ── Canvas helpers ────────────────────────────────────────────────────────────
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

// ── Settings panel ────────────────────────────────────────────────────────────
function createSettingsUI(
  onLorenzChange: () => void,
  onHalvorsenChange: () => void,
): void {
  if (document.getElementById("lorenz-settings-btn")) return

  // ── Button ────────────────────────────────────────────────────────────────
  const btn = document.createElement("button")
  btn.id = "lorenz-settings-btn"
  btn.title = "Attractor settings"
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
  document.body.appendChild(btn)

  // ── Panel ─────────────────────────────────────────────────────────────────
  const panel = document.createElement("div")
  panel.id = "lorenz-settings-panel"
  panel.setAttribute("aria-hidden", "true")
  document.body.appendChild(panel)

  btn.addEventListener("click", () => {
    const open = panel.classList.toggle("open")
    panel.setAttribute("aria-hidden", String(!open))
    btn.classList.toggle("active", open)
  })

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target as Node) && e.target !== btn) {
      panel.classList.remove("open")
      panel.setAttribute("aria-hidden", "true")
      btn.classList.remove("active")
    }
  })

  // ── Slider builder ────────────────────────────────────────────────────────
  function makeSlider(
    label: string,
    min: number,
    max: number,
    step: number,
    get: () => number,
    set: (v: number) => void,
    onChange: () => void,
  ): HTMLElement {
    const wrap = document.createElement("div")
    wrap.className = "lorenz-row"

    const lbl = document.createElement("label")
    lbl.textContent = label

    const val = document.createElement("span")
    val.className = "lorenz-val"
    val.textContent = String(+get().toFixed(4))

    const slider = document.createElement("input")
    slider.type = "range"
    slider.min = String(min)
    slider.max = String(max)
    slider.step = String(step)
    slider.value = String(get())

    slider.addEventListener("input", () => {
      const n = parseFloat(slider.value)
      set(n)
      val.textContent = String(+n.toFixed(4))
      onChange()
    })

    const header = document.createElement("div")
    header.className = "lorenz-row-header"
    header.appendChild(lbl)
    header.appendChild(val)

    wrap.appendChild(header)
    wrap.appendChild(slider)
    return wrap
  }

  // ── Section title builder ─────────────────────────────────────────────────
  function makeSection(title: string): HTMLElement {
    const h = document.createElement("h4")
    h.className = "lorenz-section"
    h.textContent = title
    return h
  }

  // ── Focus mode toggle ─────────────────────────────────────────────────────
  const focusRow = document.createElement("div")
  focusRow.className = "lorenz-focus-row"

  const focusLabel = document.createElement("span")
  focusLabel.textContent = "Focus mode"

  const focusHint = document.createElement("span")
  focusHint.className = "lorenz-focus-hint"
  focusHint.textContent = "esc to exit"

  const focusToggle = document.createElement("button")
  focusToggle.className = "lorenz-toggle"
  focusToggle.setAttribute("aria-pressed", "false")
  focusToggle.setAttribute("aria-label", "Focus mode")

  function setFocus(on: boolean): void {
    document.body.classList.toggle("lorenz-focus", on)
    focusToggle.setAttribute("aria-pressed", String(on))
    focusToggle.classList.toggle("on", on)
  }

  focusToggle.addEventListener("click", () => {
    const next = focusToggle.getAttribute("aria-pressed") !== "true"
    setFocus(next)
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("lorenz-focus")) {
      setFocus(false)
    }
  })

  focusRow.appendChild(focusLabel)
  focusRow.appendChild(focusHint)
  focusRow.appendChild(focusToggle)
  panel.appendChild(focusRow)

  // ── Lorenz section ────────────────────────────────────────────────────────
  panel.appendChild(makeSection("Main Attractor (Lorenz)"))
  panel.appendChild(makeSlider("σ (sigma)", 1, 50, 0.1, () => lorenzSigma, (v) => { lorenzSigma = v }, onLorenzChange))
  panel.appendChild(makeSlider("ρ (rho)", 1, 60, 0.5, () => lorenzRho, (v) => { lorenzRho = v }, onLorenzChange))
  panel.appendChild(makeSlider("β (beta)", 0.1, 10, 0.01, () => lorenzBeta, (v) => { lorenzBeta = v }, onLorenzChange))
  panel.appendChild(makeSlider("Speed (dt)", 0.001, 0.02, 0.0005, () => lorenzDt, (v) => { lorenzDt = v }, () => {}))
  panel.appendChild(makeSlider("Trail length", 100, 5000, 100, () => lorenzTrailLength, (v) => { lorenzTrailLength = Math.round(v) }, () => {}))
  panel.appendChild(makeSlider("Particles", 1, 6, 1, () => lorenzNumParticles, (v) => { lorenzNumParticles = Math.round(v) }, onLorenzChange))

  // ── Halvorsen section ─────────────────────────────────────────────────────
  panel.appendChild(makeSection("Side Attractors (Halvorsen)"))
  panel.appendChild(makeSlider("a", 0.1, 3, 0.01, () => halvorsenA, (v) => { halvorsenA = v }, () => {}))
  panel.appendChild(makeSlider("Speed (dt)", 0.001, 0.02, 0.0005, () => halvorsenDt, (v) => { halvorsenDt = v }, () => {}))
  panel.appendChild(makeSlider("Trail length", 100, 5000, 100, () => halvorsenTrailLength, (v) => { halvorsenTrailLength = Math.round(v) }, () => {}))
  panel.appendChild(makeSlider("Particles", 1, 6, 1, () => halvorsenNumParticles, (v) => { halvorsenNumParticles = Math.round(v) }, onHalvorsenChange))
}

// ── Main ──────────────────────────────────────────────────────────────────────
function startLorenz(): void {
  const canvas = setupCanvas()
  resizeCanvas(canvas)

  const ctx = canvas.getContext("2d")!

  // Particle arrays — rebuilt when particle-count changes
  let particles: Particle[] = Array.from({ length: lorenzNumParticles }, (_, i) => initParticle(i))
  let particlesLeft: Particle[] = Array.from({ length: halvorsenNumParticles }, (_, i) => initHalvorsen(i))
  let particlesRight: Particle[] = Array.from({ length: halvorsenNumParticles }, (_, i) => initHalvorsen(i + 3))

  function rebuildLorenz(): void {
    particles = Array.from({ length: lorenzNumParticles }, (_, i) => initParticle(i))
  }

  function rebuildHalvorsen(): void {
    particlesLeft = Array.from({ length: halvorsenNumParticles }, (_, i) => initHalvorsen(i))
    particlesRight = Array.from({ length: halvorsenNumParticles }, (_, i) => initHalvorsen(i + 3))
  }

  createSettingsUI(rebuildLorenz, rebuildHalvorsen)

  let rotZ = Math.random() * Math.PI * 2
  let rotZLeft = Math.random() * Math.PI * 2
  let rotZRight = Math.random() * Math.PI * 2

  // Warm-up
  for (let i = 0; i < 5000; i++) {
    particles.forEach(stepLorenz)
    particlesLeft.forEach(stepHalvorsen)
    particlesRight.forEach(stepHalvorsen)
  }

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

    ctx.fillStyle = isDark ? "rgba(22,22,24,0.04)" : "rgba(240,235,224,0.04)"
    ctx.fillRect(0, 0, W, H)

    rotZ += 0.0003
    rotZLeft += 0.0003
    rotZRight += 0.0003

    for (let s = 0; s < 5; s++) {
      particles.forEach(stepLorenz)
      particlesLeft.forEach(stepHalvorsen)
      particlesRight.forEach(stepHalvorsen)
    }

    function drawAttractor(
      pts: Particle[],
      cx: number,
      cy: number,
      sc: number,
      rZ: number,
      dotR: number,
      lw: number,
      czOffset = 25,
    ): void {
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
          const [px2, py2] = project(
            trail[j - drawEvery].x,
            trail[j - drawEvery].y,
            trail[j - drawEvery].z,
            cx, cy, sc, 0.6, rZ, czOffset,
          )
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

    drawAttractor(particles, W / 2, H / 2, scale, rotZ, 1.5, 0.8)

    const sideScale = scale * 0.75
    drawAttractor(particlesLeft, W * 0.12, H / 2, sideScale, rotZLeft, 1.0, 0.55, 0)
    drawAttractor(particlesRight, W * 0.88, H / 2, sideScale, rotZRight, 1.0, 0.55, 0)

    frameId = requestAnimationFrame(draw)
  }

  draw()

  document.addEventListener("nav", () => {
    cancelAnimationFrame(frameId)
    const c = document.getElementById("lorenz-canvas") as HTMLCanvasElement | null
    if (!c) {
      startLorenz()
    } else {
      frameId = requestAnimationFrame(draw)
    }
  })
}

startLorenz()
