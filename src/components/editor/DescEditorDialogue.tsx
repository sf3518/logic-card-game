import React, { useState, useContext } from 'react'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import MButton from '@material-ui/core/Button'
import { EditorContext } from './LevelEditor'
import TextField from '@material-ui/core/TextField'
import { Divider } from '@material-ui/core'

interface Props {
  open: boolean
  title: string
  desc: string[]
  onSubmit: (title: string, desc: string[]) => void
  onCancel: () => void
}

export const DescEditorDialogue = ({
  open,
  title,
  desc ,
  onSubmit,
  onCancel, 
}: Props) => {

  const context = useContext(EditorContext)

  const [localTitle, setTitle] = useState(title)
  const [localDesc, setDesc] = useState<string>(desc.join('\n'))

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDesc(event.target.value)
  }

  const submit = () => {
    const newDesc = localDesc.split(/\r\n|\n|\r/).filter(it => it.length != 0)
    onSubmit(localTitle, newDesc)
  }

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Edit title and description</DialogTitle>
      <DialogContent>
        <div>
          <TextField
            id="standard-textarea"
            label="Title"
            placeholder="Enter your title here"
            value={localTitle}
            onChange={handleTitleChange}
            multiline
          />
        </div>
        <div style={{ marginTop: '20px', marginBottom: '20px' }}/>
        <div>
          <TextField
            id="filled-textarea"
            label="Description"
            placeholder="Make a new pop-up card by making a new line"
            multiline
            variant="filled"
            onChange={handleDescChange}
          /> 
        </div>
        <DialogActions>
          <MButton color='secondary' onClick={onCancel}>CANCEL</MButton>
          <MButton color='primary' onClick={submit}>SUBMIT</MButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}