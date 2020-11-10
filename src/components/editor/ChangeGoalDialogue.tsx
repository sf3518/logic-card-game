import React, { useContext, useState, useEffect } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import MButton from '@material-ui/core/Button'
import { EditorContext } from './LevelEditor'
import { GoalInJSON, GoalKind } from '../../types'
import { getExprFromJson } from '../../server/gameApp/game/goal'

interface Props {
  updateGoal: (goal: GoalInJSON) => void
  confirmGoal: () => void
  deleteGoal: (gid: number) => void
}

export const ChangeGoalDialogue = ({
  updateGoal,
  confirmGoal,
  deleteGoal
}: Props) => {
  const context = useContext(EditorContext)
  const state = context.state
  const goal = state.kind == 'changeGoal' ? state.newGoal : undefined
  const index = state.kind == 'changeGoal' ? state.gid : -1

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeGoalAim(event.target.value as GoalKind)
  }

  const changeGoalAim = (goalKind: GoalKind) => {
    if (goal) {
      switch(goalKind) {
        case 'paradox':
        case 'tautology':
          updateGoal({ kind: goalKind })
        default:
          const expr = getExprFromJson(goal)
          updateGoal({ kind: goalKind, expr: expr })
      }
    }
  }
   
  return (
    <Dialog open={context.state.kind == 'changeGoal'} onClose={context.setIdle}>
      <DialogTitle>{"Change Goal No. " + (index + 1)}</DialogTitle>
      <DialogContent> 
        <FormControl component="fieldset">
          <FormLabel component="legend">Choose aim</FormLabel>
          <RadioGroup aria-label="Select aim" name="aim" value={goal?.kind} onChange={handleRadioChange}>
            <FormControlLabel value='prove' control={<Radio/>} label='Prove'/>
            <FormControlLabel value='disprove' control={<Radio/>} label='Disprove'/>
            <FormControlLabel value='unknown' control={<Radio/>} label='Unknown'/>
            <FormControlLabel value='equivalent' control={<Radio/>} label='Equivalent'/>
            <FormControlLabel value='tautology' control={<Radio/>} label='Tautology'/>
            <FormControlLabel value='paradox' control={<Radio/>} label='Paradox'/>
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <MButton onClick={() => { confirmGoal(); context.setIdle() }}>CONFIRM</MButton>
        <MButton onClick={() => { deleteGoal(index!!); context.setIdle() }} color="secondary">DELETE THIS GOAL</MButton>
      </DialogActions>
    </Dialog>
  )
}