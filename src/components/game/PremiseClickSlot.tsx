import { useDrop } from "react-dnd"
import { ItemTypes } from "./ItemTypes"
import React, { useContext } from "react"
import Context from "./gameContext"
import { Card } from "react-bootstrap"

interface PremiseDropSlotProps {
  premiseIndex: number
  slotPosition: number
  isLocked: boolean
}

export const PremiseClickSlot = ({
  premiseIndex,
  slotPosition,
  isLocked,
}: PremiseDropSlotProps) => {

  const context = useContext(Context)

  return (
    <div style={
      {
        width: '20px',
        height: '110px',
        backgroundColor: isLocked ? "rgba(0,0,0,0)" : "rgba(40, 160, 30, 0.75)"
      }}

      onClick={() => {
        if (!isLocked && context.handCardSelected) {
          context.moveHandCardToPremise(premiseIndex, slotPosition)
        }
      }}
    >
      
    </div>
  )

} 