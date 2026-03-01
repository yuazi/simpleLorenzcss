import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/lorenz.inline"
import style from "./styles/lorenz.scss"

const LorenzBackground: QuartzComponent = () => {
  // The canvas is injected by the inline script into document.body.
  // This component renders nothing itself.
  return <></>
}

LorenzBackground.css = style
LorenzBackground.afterDOMLoaded = script

export default (() => LorenzBackground) satisfies QuartzComponentConstructor
