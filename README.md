# simpleLorenzcss

Lorenz and Halvorsen attractor canvas background for Quartz v4, featuring a live settings panel and focus mode.

## Overview

This project provides an interactive animated background for [Quartz](https://quartz.jzhao.xyz/) wikis. It simulates the Lorenz and Halvorsen attractors, projecting their 3D paths onto a 2D background canvas.

- **Interactive Settings**: Real-time control over sigma, rho, beta, speed, trail length, and particle count.
- **Focus Mode**: Immersive view that hides page chrome (header, sidebar, footer) to emphasize the animation.
- **Persistence**: User adjustments are saved to `localStorage` and persist across sessions.
- **Theming**: Automatic palette switching between light and dark modes based on the Quartz theme.

## How it works

The script uses the classic Lorenz equations (σ=10, ρ=28, β=8/3) for the central attractor and the Halvorsen equations for the two flanking curves. Each frame:

1. Particles are stepped forward with a small time-delta (dt).
2. Their 3D positions are projected to 2D with a slow rotation.
3. A fading trail is drawn on a `<canvas>` element fixed behind the page content using `pointer-events: none`.
4. Focus mode is toggled via the settings panel or the `Escape` key, applying an opacity transition to standard Quartz layout elements (header, siderbars, article) to isolate the animation.

## Files

| File | Description |
|------|-------------|
| `lorenz.inline.ts` | Core script containing the attractor physics, rendering loop, and settings UI logic |
| `lorenz.css` | Styles for the background canvas, interactive panel, and focus mode transitions |
| `LorenzBackground.tsx` | Quartz component that integrates the script and CSS into the layout |

## Integration Guide

Follow these steps to integrate the background into a Quartz v4 project.

### 1. File Placement

Copy the files from this repository into your Quartz project:

- Move `LorenzBackground.tsx` to `quartz/components/`
- Move `lorenz.inline.ts` to `quartz/components/scripts/`
- Move `lorenz.css` to `quartz/components/styles/lorenz.scss` 

**Note**: The `.css` file must be renamed to `.scss` for Quartz's build system to process it as a style module.

### 2. Component Registration

Register the component in `quartz/components/index.ts`:

```typescript
import LorenzBackground from "./LorenzBackground"

export {
  // ... existing exports
  LorenzBackground,
}
```

### 3. Layout Configuration

Add the component to your shared layout in `quartz.layout.ts`. Placing it in `beforeBody` is recommended for background initialization:

```typescript
import { LorenzBackground } from "./quartz/components"

// ...

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  beforeBody: [
    Component.MobileOnly(Component.Explorer()),
    LorenzBackground(),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
    },
  }),
}
```

### 4. Build and Preview

Start the local development server:

```bash
npx quartz build --serve
```

The settings panel can be accessed via the gear icon in the bottom-right corner of the page.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
