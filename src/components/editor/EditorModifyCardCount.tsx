import React, { useContext, useState, useEffect } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import MButton from '@material-ui/core/Button'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Input from '@material-ui/core/Input'
import { EditorContext } from './LevelEditor'
import { Grid } from '@material-ui/core'

interface Props {
  hpos: number
  onSubmit: (count: number) => void
}

const defaultValue = 1

export const EditorModifyCardCountDialogue = ({
  hpos,
  onSubmit
}: Props) => {

  const context = useContext(EditorContext)
  const [count, setCount] = useState(0)
  const [isInfty, setIsInfty] = useState(true)

  useEffect(() => {
    if (hpos < context.handCards.length) {
      const init = context.handCards[hpos][1]
      setCount(init === Number.POSITIVE_INFINITY ? defaultValue : init)
      setIsInfty(init === Number.POSITIVE_INFINITY)
    }
  }, [context, hpos])

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsInfty(event.target.value === 'true')
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const num = event.target.value === '' ? 1 : Number(event.target.value)
    setCount(Math.min(Math.max(num, 0), 10))
  }

  const submit = () => {
    onSubmit(isInfty ? Number.POSITIVE_INFINITY : count)
  }

  return( 
    <Dialog open={context.state.kind === 'changeHand'} title="Modify card number" onClose={context.setIdle}>
      <DialogContent>
        <RadioGroup aria-label="quiz" name="quiz" value={isInfty} onChange={handleRadioChange}>
          <FormControlLabel value={true} control={<Radio />} label="∞" />
          <Grid container spacing={1}>
            <Grid item>
              <FormControlLabel value={false} control={<Radio />} label="Count: " />
              <Input 
                margin="dense" 
                onChange={handleInputChange}
                disabled={isInfty}
                inputProps={{
                  defaultValue: count === Number.POSITIVE_INFINITY ? defaultValue : count,
                  step: 1,
                  min: 0,
                  max: 10,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
          </Grid>
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <MButton onClick={submit}>SUBMIT</MButton>
        <MButton onClick={context.setIdle} color='secondary'>CANCEL</MButton>
      </DialogActions>
    </Dialog>
  )

}