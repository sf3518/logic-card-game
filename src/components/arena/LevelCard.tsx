import React from 'react'
import { LevelView } from '../../types'
import { LinkContainer } from 'react-router-bootstrap'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'

import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import DownIcon from '@material-ui/icons/KeyboardArrowDown'
import "./LevelCard.css"
interface Props {
  view: LevelView
}

export const LevelCard = ({ view }: Props) => {

  const title = view.title.length >= 33 ? view.title.slice(0, 30) + "..." : view.title

  return (
      <Card style={{ width: 'auto', height: '200px', padding: '10px', margin: '10px'}} >
        <CardContent>
          <LinkContainer to={"/arena/level/" + view.lid} style={{ width: 'auto' }} className={"my_link"}>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
          </LinkContainer>
          <LinkContainer to={"/user/" + view.uid} className={"my_link"}>
            <Typography variant="body2" color="textSecondary" component="p" style={{  }}>
              {view.author}
            </Typography>
          </LinkContainer>
        </CardContent>
        <CardActions>
          <Typography>
              <UpIcon/>
              {view.likes}
            </Typography>
            <Typography>
              <DownIcon/>
              {view.dislikes}
            </Typography>
        </CardActions>
      </Card>

  )
}