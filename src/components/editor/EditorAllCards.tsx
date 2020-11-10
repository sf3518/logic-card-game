import React, { useContext } from 'react'
import { Card } from '../../types'

import { allCards as AllCards} from './editorUtils'
import makeStyles from '@material-ui/core/styles/makeStyles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { CardComponent } from '../game/Card';
import { EditorContext } from './LevelEditor';

import DeleteIcon from '@material-ui/icons/Delete'
import { Container, Tooltip } from '@material-ui/core';

interface NewCardsProps {
  onSelect: (c: Card) => void
  onDrop: () => void
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 400,
    height: 200,
  },
}));


export const EditorAllCards = ({
  onSelect, 
  onDrop
}: NewCardsProps) => {

  const classes = useStyles()
  const context = useContext(EditorContext)

  const onSelection = context.state.kind == 'select'

  const selected = (card: Card) => context.state.kind == 'select'
    && context.state.select.kind == 'all'
    && context.state.select.card == card

  const renderAllCards = () => <Tooltip title="Click any card to select it" arrow>
    <div className={classes.root}>
      <GridList cellHeight={140} className={classes.gridList} cols={4}>
        {AllCards.map(card => 
          <GridListTile key={card} cols={1}>
            <CardComponent 
              cardSymbol={card} 
              scale={1} 
              tag={undefined} 
              isSelected={selected(card)} 
              onClick={() => onSelect(card)}
            />
          </GridListTile>
        )}
      </GridList>
    </div>
  </Tooltip>

  const renderDustBin = () => <Tooltip title="Click me to delete the selected card" arrow >
    <Container 
      className={classes.gridList} 
      style={{ backgroundColor: '#FA6363', color: 'white', alignItems: 'center'}} 
      onClick={onDrop}>
      <DeleteIcon style={{ fontSize: 100 }}/>
    </Container>
  </Tooltip>

  return onSelection ? renderDustBin() : renderAllCards() 
}