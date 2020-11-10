import React from 'react'
import { LevelView } from '../../types'
import Container from '@material-ui/core/Container'
import { Grid } from '@material-ui/core'
import { LevelCard } from '../arena/LevelCard'

interface Props {
  levels: LevelView[]
}

export const UserPageLevels = ({ levels }: Props) => {
  
  return (
    <Container>
      <Grid container spacing={2}>
        {levels.map(level => <Grid item xs={2}><LevelCard view={level}/></Grid>)}
      </Grid>
    </Container>
  )
}