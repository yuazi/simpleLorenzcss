# simpleLorenzcss

Lorenz + Halvorsen attractor canvas background I use in my [Quartz](https://quartz.jzhao.xyz/) wiki.

## Files

| File | Description |
|------|-------------|
| `lorenz.inline.ts` | Canvas animation – simulates the Lorenz attractor (centre) and two Halvorsen attractors (sides), drawn with trail effects and slow rotation |
| `lorenz.css` | CSS for the `#lorenz-canvas` element injected by the script |
| `LorenzBackground.tsx` | Quartz component that wires the script and CSS together |

## How it works

The script uses the classic Lorenz equations (σ=10, ρ=28, β=8/3) for the central attractor and the Halvorsen equations for the two flanking curves. Each frame:

1. Particles are stepped forward with a small time-delta (Δt = 0.005).
2. Their 3-D positions are projected to 2-D with a slow rotation.
3. A fading trail is drawn on an off-screen `<canvas>` element fixed behind the page content.

Colours automatically switch between light-mode and dark-mode palettes by reading Quartz's `saved-theme` attribute.

## Usage in Quartz

1. Copy `LorenzBackground.tsx` → `quartz/components/`
2. Copy `lorenz.inline.ts` → `quartz/components/scripts/`
3. Copy `lorenz.css` → `quartz/components/styles/lorenz.scss` (rename to `.scss`; the file contains plain CSS and is valid SCSS without any changes)
4. Export the component from `quartz/components/index.ts`:

```ts
import LorenzBackground from "./LorenzBackground"
export { /* …existing exports…, */ LorenzBackground }
```

5. Add it to your layout in `quartz.layout.ts` (e.g. in `beforeBody` or `left`):

```ts
import { LorenzBackground } from "./quartz/components"

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  beforeBody: [LorenzBackground()],
  footer: Component.Footer({ links: {} }),
}
```

The component renders nothing itself — it just injects a `<canvas id="lorenz-canvas">` into `document.body` via the inline script.
