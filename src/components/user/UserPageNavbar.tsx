import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import MenuIcon from '@material-ui/icons/Menu'
import { useStyles } from '../appbar'
import { LinkContainer } from 'react-router-bootstrap'


export const UserPageNavBar = () => {

  const classes = useStyles()

  return (
    <AppBar position="static">
      <Toolbar style={{ backgroundColor: '#F2994A'}}>
        <Typography variant="h6" className={classes.title}>
          
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