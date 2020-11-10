import React from 'react'
import AppBar from '@material-ui/core/AppBar/AppBar'
import { useStyles } from '../appbar'
import { LinkContainer } from 'react-router-bootstrap' 
import Typography from '@material-ui/core/Typography/Typography'
import Toolbar from '@material-ui/core/Toolbar/Toolbar'
import IconButton from '@material-ui/core/IconButton/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

export const ArenaNavBar = (): JSX.Element => {
  const classes = useStyles()

  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar style={{ backgroundColor: '#F2994A'}}>
        <Typography variant="h6" className={classes.title} style={{ font: 'Consolas' }}>
          Arena
        </Typography>
        <LinkContainer to="/">
          <IconButton 
            edge="start" 
            className={classes.menuButton} 
            color="inherit" 
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
        </LinkContainer>
      </Toolbar>
    </AppBar>
  )
}