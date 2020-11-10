import React, { useState, useEffect } from 'react'
import { UserInfo, LevelView } from '../../types'

import Container from '@material-ui/core/Container'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { makeStyles, createStyles, Grid, Paper } from '@material-ui/core'
import { UserPageLevels } from './UserPageLevels'
import Axios, { AxiosRequestConfig } from 'axios'
import { Paths } from '../../routesPaths'

interface Props {
  profile: UserInfo
}

const useStyles = makeStyles(theme => 
  createStyles({
    title: {
      textAlign: 'center'
    },
    large: {
      width: theme.spacing(12),
      height: theme.spacing(12),
      fontSize: 40,
      margin: "20px"
    }
  })
)

export const UserPageProfile = ({ profile }: Props) => {

  const classes = useStyles()

  return (
    <Grid container  
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: '15vh', marginTop:"30px", marginBottom:"30px" }}
      
    >
      <Grid item xs={3}>
        <Avatar className={classes.large}>{profile.username.slice(0, 2).toUpperCase()}</Avatar>
      </Grid>
      <Grid item xs={3}>
        <Typography variant="h4" className={classes.title}>{profile.username}</Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography variant="subtitle2" className={classes.title}>{profile.email}</Typography>
      </Grid>
    </Grid>
  )
}