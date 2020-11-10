import React from 'react'
import { LevelView } from '../../types'
import { LevelCard } from './LevelCard'
import Container from '@material-ui/core/Container'
import IconButton from '@material-ui/core/IconButton'
import Grid from '@material-ui/core/Grid'
import MoreIcon from '@material-ui/icons/MoreHoriz'
import AddIcon from '@material-ui/icons/Add'


interface Props {
  onShowMore: () => void
  levels: LevelView[]
  isLoading: boolean
}

export const ArenaMainBoard = ({
  onShowMore,
  levels,
  isLoading
}: Props) => {

  const style = { fontSize: '80px' }

  return (
      <Grid container spacing={3} style={{ margin: '20px' }}>
        {levels.map(l => <Grid item xs={2}><LevelCard view={l}/></Grid>)}
        <Grid item xs={1}>
          <IconButton disabled={isLoading} onClick={onShowMore}>
            {isLoading ? <MoreIcon style={style} /> : <AddIcon style={style}/>}
          </IconButton>
        </Grid>
      </Grid>
  )
}