import React, { useContext } from 'react'
import { LevelsFilter } from '../../types'
import { ArenaContext } from './arenaContext'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import MButton from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Fab from '@material-ui/core/Fab'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '@material-ui/icons/Add'



interface Props {
  onAddFilter: (f: LevelsFilter) => void
  onDeleteFilter: (i: number) => void
}

export const ArenaBottomNav = () => {
  const context = useContext(ArenaContext)

  return (
    <BottomNavigation
      value={0}
      showLabels
      style={{
        width: '100%',
        position: 'sticky',
        bottom: 0,
      }}
    > 
      <Grid container spacing={1}>
        <Grid item xs={10}>

        </Grid>
        <Grid item xs={1}>
          <Tooltip title="Add a filter">
            {/* <Fab style={{ left: 40, backgroundColor: '#F2994A', color:'#fff' }} onClick={setAddGoal}>
              <AddIcon style={{ fontSize: '30' }}/>
            </Fab> */}
          </Tooltip>
        </Grid>
      </Grid>
    </BottomNavigation>
  )
}