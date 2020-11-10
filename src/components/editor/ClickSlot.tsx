import React, { useContext } from "react"
import { EditorContext } from "./LevelEditor"
import { Tooltip } from "@material-ui/core"

interface PremiseDropSlotProps {
  onDrop: () => void
  isActive: boolean
  scale: number
}

export const EditorClickSlot = ({
  onDrop,
  isActive,
  scale
}: PremiseDropSlotProps) => {

  const context = useContext(EditorContext)
  const width = 20 * scale
  const height = 110 * scale

  return (
    <Tooltip title={isActive ? "click me to place card here" : ""} arrow>
      <div style={
        {
          width: width + 'px',
          height: height + 'px',
          backgroundColor: isActive ? "rgba(40, 160, 30, 0.75)" : "rgba(0,0,0,0)"
        }}
        onClick={isActive ? onDrop : () => {}}
      >
      </div>
    </Tooltip>
  )

} 