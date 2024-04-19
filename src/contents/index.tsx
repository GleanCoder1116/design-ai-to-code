import styleText from "data-text:~/contents/index.scss"
import type {
  PlasmoCSConfig,
  PlasmoGetStyle,
} from "plasmo"
import React from "react"
import ContentArea from "~ContentArea"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.figma.com/file/*/**",
    "https://mastergo.com/file/*/**",
  ],
  world: "MAIN",
}

export const HOST_ID = `design-ai-to-code`

// export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText

  return style
}

const PlasmoOverlay = () => {
    return (
        <div>
            <ContentArea />
        </div>
    )
}

export default PlasmoOverlay
