import React, { useState, useContext } from 'react'
import { Goal } from '../../types'
import { Card, Table, Button } from 'react-bootstrap'
import { PremiseComponent } from '../game/Premise'
import * as Types from '../../types'
import SUCCESSFUL_ICON from '../../src_img/card_UI/correct.jpg'
import UNSUCCESSFUL_ICON from '../../src_img/card_UI/incorrect.jpg'
import { genTruthTableInStringForBTrees } from '../../server/gameApp/logicResolver/plainResolver'
import { makeStyles, Theme, createStyles, Button as MButton, Popover, Typography, List, ListItem, IconButton, Divider } from '@material-ui/core'
import { EditorContext } from './LevelEditor'
import { BoolTree } from '../../server/gameApp/logicResolver/bools'
import { parsePremiseSafe } from '../../server/gameApp/game/premise'
import { EditorPremise } from './EditorPremise'
import { getExprFromJson } from '../../server/gameApp/game/goal'
import EditIcon from '@material-ui/icons/Edit'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    typography: {
      padding: theme.spacing(2),
    },
  }),
);

interface GoalsProps {
  isSuccessful: boolean[]
  onSelect: (gid: number, gpos: number) => void
  onDrop: (gid: number, gpos: number) => void
  onChange: (gid: number) => void

}

export const EditorGoal = ({
  isSuccessful,
  onSelect,
  onDrop,
  onChange,
}: GoalsProps) => {

  const context = useContext(EditorContext)
  const goals = context.goals

  const [showTable, setShowTable] = useState(goals.map(_ => false))

  const classes = useStyles()
  const [anchorEls, setAnchorEl] = React.useState<(HTMLButtonElement | null)[]>(goals.map(_ => null));
  const handleClick = (i: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
    const newAnchorEls = anchorEls.slice()
    newAnchorEls.splice(i, 1, event.currentTarget) 
    setAnchorEl(newAnchorEls);
  }
  const handleClose = (i: number) => () => {
    const newAnchorEls = anchorEls.slice()
    newAnchorEls.splice(i, 1, null) 
    setAnchorEl(newAnchorEls);
  }

  const ids = anchorEls.map((a, i) => a ? 'popover' + i : undefined)

  const setShowOneTable = (i: number, isShow: boolean) => {
    setShowTable(showTable.map((old, j) => i == j ? isShow : old))
  }

  const renderSuccessful = (i: number) => {
    return <div style={{ 
      width: '30px', 
      height: '30px', 
      backgroundImage: "url(" + (isSuccessful[i] ? SUCCESSFUL_ICON : UNSUCCESSFUL_ICON) + ")",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    }}></div>
  }

  const renderChangeButton = (i: number) => 
    <IconButton onClick={() => onChange(i)}><EditIcon fontSize="large"/></IconButton>

  const collectVars = (i: number): Types.Card[] => {
    const set = new Set<Types.Card>()
    getExprFromJson(goals[i]).filter(c => ["A", "B", "C", "D"].includes(c)).forEach(c => set.add(c))
    return Array.from(set)
  }

  const renderShowTableButton = (i: number) => {
    if (undefined) {
      return <div></div>
    }
    return (
      <div>
        <MButton aria-describedby={ids[i]} onClick={handleClick(i)} color="primary">Hint</MButton>
        <Popover 
          id={ids[i]} 
          open={Boolean(ids[i])} 
          anchorEl={anchorEls[i]}
          onClose={handleClose(i)}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
        >
          <Typography className={classes.typography}>{renderTruthTable(i)}</Typography>
        </Popover>
      </div>
    )
  }

  const renderTruthTable = (i: number) => {
    const vars = collectVars(i)
    const truthTable = genTruthTableInStringForBTrees(vars, [context.goalTrees[i]]) 
    return (
      <Table onClick={() => setShowOneTable(i, false)}>
        <thead>
          {truthTable.headers.map(it => <td style={{ paddingTop: "0.25rem", paddingBottom: "0.25rem", }}>{it}</td>)}
        </thead>
        {truthTable.body.map(row => <tr>
          {row.map(it => <td style={{ paddingTop: "1px", paddingBottom: "1px", }}>{it}</td>)}
        </tr>)}
      </Table>
    )
  }

  const showGoalInCards = (i: number): JSX.Element => {
    const goal = context.goals[i]
    switch(goal.kind) {
      case 'tautology':
      case 'paradox':
        return <div></div>
    }
    return <EditorPremise
      category={{ kind: 'goal', index: i }}
      scale={0.5}
      onLock={undefined}
      onSelect={pos => onSelect(i, pos)}
      onDrop={pos => onDrop(i, pos)}
    />
  }

  const renderGoal = (i: number) => {
    return <ListItem>
      <td>{renderSuccessful(i)}</td>
      <td style={{verticalAlign: "center"}}>{
        <h4 style={{ marginLeft: "10px", marginRight: "10px"}}>{
          showGoalKind(i + 1, goals[i])
        }</h4>
      }</td>
      <td>{showGoalInCards(i)}</td>
      <td align='right'>{renderShowTableButton(i)}</td>
      <td align='right'>{renderChangeButton(i)}</td>
      { i != 0 ? <Divider/> : undefined }
    </ListItem>
  }

  const renderGoals = () => {
    const result: JSX.Element[] = []
    for(let i = 0; i < goals.length; i++) {
      result.push(renderGoal(i))
    }
    return <List>{result}</List>
  }

  return renderGoals()

}

function showGoalKind(index: number, goal: Types.GoalInJSON): string {
  let showKind: string
  switch(goal.kind) {
    case 'prove': showKind = 'To prove:'; break
    case 'disprove': showKind = 'To disprove:'; break
    case 'unknown': showKind = 'Make undecidable:'; break
    case 'equivalent': showKind = 'To be equivalent to:'; break
    case 'tautology': showKind = 'Make a tautology'; break
    case 'paradox': showKind = 'Make a paradox'; break
  }
  return index + ". " + showKind + " "
}