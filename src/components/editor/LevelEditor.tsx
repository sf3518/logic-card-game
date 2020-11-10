import React, { useContext, useState, useEffect } from 'react'
import { LoginContext } from '../../LoginContext'
import { Premise, GoalInJSON, Card, Goal, LevelSetupJsonFormat } from '../../types'
import { useStyles } from '../appbar'
import { 
  onIndex, 
  moveFromTo, 
  deleteCardAt, 
  addHandCard, 
  getAHandCard, 
  insertCardTo, 
  onGoalJson, 
  moveWithin, 
  deleteHandCard, 
  changeCountHandCard } from './editorUtils'
import { EditorPremise } from './EditorPremise'
import { EditorHand } from './EditorHand'
import { BoolTree } from '../../server/gameApp/logicResolver/bools'
import AppBar from '@material-ui/core/AppBar/AppBar'
import { fromGoalJson, parseGoalTreeSafe, getExprFromJson } from '../../server/gameApp/game/goal'
import { evalSuccess } from '../../game/views'
import { EditorGoal } from './EditorGoals'
import { EditorAllCards } from './EditorAllCards'
import Axios, { AxiosRequestConfig } from 'axios'
import { Table, Button, Modal, Form } from 'react-bootstrap'
import { Paths } from '../../routesPaths'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import MButton from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { LinkContainer } from 'react-router-bootstrap'
import MenuIcon from '@material-ui/icons/Menu'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import UndoIcon from '@material-ui/icons/Undo'
import RemoveIcon from '@material-ui/icons/Remove'
import FeedbackIcon from '@material-ui/icons/Feedback'
import PublishIcon from '@material-ui/icons/Publish'
import HelpIcon from '@material-ui/icons/Help'
import { ChangeGoalDialogue } from './ChangeGoalDialogue'
import { Fab, Grid, Tooltip, GridList, GridListTile, BottomNavigation, TextField, LinearProgress } from '@material-ui/core'
import { EditorModifyCardCountDialogue } from './EditorModifyCardCount'
import { parsePremiseSafe } from '../../server/gameApp/game/premise'
import { DescEditorDialogue } from './DescEditorDialogue'
import { TruthTable } from '../game/Truthtable'
import TUTORIAL_1 from "../../src_img/tutorial/HELP_1.gif"
import TUTORIAL_2 from "../../src_img/tutorial/HELP_2.gif"
import TUTORIAL_3 from "../../src_img/tutorial/HELP_3.gif"


type EditorState = { kind: 'idle' }
                 | { kind: 'changeHand' }
                 | { kind: 'select', select: SelectState }
                 | { kind: 'changeGoal', gid: number, newGoal: GoalInJSON }

type SelectState = { kind: 'premise', pid: number, ppos: number }
                 | { kind: 'hand', hpos: number }
                 | { kind: 'goal', gid: number, gpos: number }
                 | { kind: 'all', card: Card }

interface EditorHistory {
  premises: Premise[]
  lockedPremises: number[]
  handCards: [Card, number][]
  goals: GoalInJSON[]
}

type EditorContexts = {
  state: EditorState
  premises: Premise[]
  handCards: [Card, number][]
  goals: GoalInJSON[]
  goalTrees: (BoolTree | undefined)[]
  lockedPremises: number[]
  setIdle: () => void
}


export const EditorContext = React.createContext<EditorContexts>({
  state: { kind: 'idle' },
  premises: [],
  handCards: [],
  goals: [],
  lockedPremises: [],
  goalTrees: [],
  setIdle: () => {}
})

export const LevelEditor = () => {
  const classes = useStyles()
  const logins = useContext(LoginContext)

  const [title, setTitle] = useState("A new level")
  const [desc, setDesc] = useState<string[]>([])
  const [state, setState] = useState<EditorState>({ kind: 'idle' })
  const [premises, setPremises] = useState<Premise[]>([[], [], [], []])
  const [lockedPremises, setLockedPremises] = useState<number[]>([0,2,3])
  const [handCards, setHandCards] = useState<[Card, number][]>([])
  const [goals, setGoals] = useState<GoalInJSON[]>([{ kind: 'prove', expr: ['A']}])
  const [goalTrees, setGoalTrees] = useState<(BoolTree|undefined)[]>([])
  const [isSuccess, setSuccess] = useState<boolean[]>(premises.map(_ => false))
  const [history, setHistory] = useState<EditorHistory[]>([])

  const [isShowDrawer, setShowDrawer] = useState(false)
  const [isShowHelp, setShowHelp] = useState(false)
  const [isShowTruthTable, setShowTruthTable] = useState(false)
  const [isChangeDesc, setChangeDesc] = useState(false)
  const [onConfirm, setOnConfirm] = useState(false)
  const [onSubmit, setOnSubmit] = useState(false)
  const [onModifyCardPos, setModifyCardPos] = useState<number>(0)

  const tutorials: object[] = [
  <div><Form><Form.Label>How to unselect a card?</Form.Label></Form><img src={TUTORIAL_1} width="500"/></div>,
  <div>
    <Form>
      <Form.Label>Locked premise: available for player to modify.</Form.Label>
      <Form.Label>Unlocked premise: player can only read without modify.</Form.Label>
    </Form>
    <img src={TUTORIAL_2} width="500"/></div>,
  <div><Form><Form.Label>How to unlock a premise?</Form.Label></Form><img src={TUTORIAL_3} width="500"/></div>]
  const [tutorialIndex, setTutorialIndex] = useState(0)
 
  // set goalTrees on goals change
  useEffect(() => {
    const trees = goals.map(g => parseGoalTreeSafe(g))
    setGoalTrees(trees)
    console.log(trees)
    
    const gs: (Goal | undefined)[] = goals.map((g, i) => { 
      switch (g.kind) {
        case 'paradox':
        case 'tautology':
          return { kind: g.kind, expr: undefined, boolTree: undefined }      
        default:
          return trees[i] ? { kind: g.kind, expr: g.expr, boolTree: trees[i]! } : undefined
      }
    })
    setSuccess(evalSuccess(premises, gs))
  }, [goals, premises])

  const evictJson = (): LevelSetupJsonFormat => {
    const cards: Card[] = []
    const limitedCards: [Card, number][] = []
    handCards.forEach(([card, count]) => {
      if (count == Number.POSITIVE_INFINITY) {
        cards.push(card)
      } else {
        limitedCards.push([card, count])
      }
    })

    return {
      title: title,
      premises: premises,
      lockedPremises: lockedPremises,  
      cards: cards,
      limitedCards: limitedCards,
      goals: goals,
      description: desc
    }
  }

  // state handlers

  const setSelect = (select: SelectState) => {
    setState({ kind: 'select', select: select })
  }

  const setIdle = () => setState({ kind: 'idle' })

  const setHandCardCount = (hpos: number, count: number) => {
    const hcs = changeCountHandCard(hpos, count)(handCards).state
    setHandCards(hcs)
    setIdle()
  }

  const setLockPremise = (i: number) => {
    if (lockedPremises.includes(i)) {
      setLockedPremises(lockedPremises.filter(j => j != i))
    } else {
      setLockedPremises(lockedPremises.concat(i))
    }
  }

  const setAddGoal = () => {
    setGoals(goals.concat({ kind: 'prove', expr: [] }))    
  }

  const setRemoveGoal = (gid: number) => {
    setGoals(goals.filter((_, i) => gid != i))
  }

  const setModifyGoal = (gid: number, goal: GoalInJSON) => {
    setGoals(goals.map((g, i) => i == gid ? goal : g))
  }

  const setOpenHandCardEditor = (i: number) => {
    setModifyCardPos(i)
    setState({ kind: 'changeHand' })
  }

  const pushHistory = () => {
    const curr: EditorHistory = {
      premises: premises,
      lockedPremises: lockedPremises,
      handCards: handCards,
      goals: goals
    }
    setHistory([curr].concat(history))
  }

  const undoHistory = () => {
    if (history.length > 0) {
      const last = history[0]
      setHistory(history.slice(1))
      setPremises(last.premises)
      setLockedPremises(last.lockedPremises)
      setHandCards(last.handCards)
      setGoals(last.goals)
    }
  }

  // Drop event handlers
  const onDropToPremise = (pid: number, ppos: number) => {
    if (state.kind === 'select') {
      const select = state.select
      switch (select.kind) {
        case 'premise': {
          const ps = moveWithin(premises, onIndex(select.pid, deleteCardAt(select.ppos)), card => onIndex(pid, insertCardTo(card, ppos)))
          setPremises(ps)
          break
        } 
        case 'hand': {
          const [hcs, ps] = moveFromTo(
            handCards, getAHandCard(select.hpos), 
            premises, card => onIndex(pid, insertCardTo(card, ppos))
          )
          setPremises(ps)
          setHandCards(hcs)
          break
        }
        case 'goal': {
          const [gs, ps] = moveFromTo(
            goals, onIndex(select.gid, onGoalJson(deleteCardAt(select.gpos))),
            premises, card => onIndex(pid, insertCardTo(card, ppos))
          )
          setGoals(gs)
          setPremises(ps)
          break
        }
        case 'all': {
          const ps = onIndex(pid, insertCardTo(select.card, ppos))(premises).state
          setPremises(ps)
          break
        }
      }
      pushHistory()
      setIdle()
    }
  }

  const onDropToHand = () => {
    if (state.kind === 'select') {
      const select = state.select
      switch (select.kind) {
        case 'premise': {
          const [ps, hcs] = moveFromTo(
            premises, onIndex(select.pid, deleteCardAt(select.ppos)), 
            handCards, card => addHandCard(card, 1)
          )
          setPremises(ps)
          setHandCards(hcs)
          break
        } 
        case 'hand': {
          const hcs = moveWithin(handCards, getAHandCard(select.hpos), card => addHandCard(card, 1))
          setHandCards(hcs)
          break
        }
        case 'goal': {
          const [gs, hcs] = moveFromTo(
            goals, onIndex(select.gid, onGoalJson(deleteCardAt(select.gpos))),
            handCards, card => addHandCard(card, 1)
          )
          setGoals(gs)
          setHandCards(hcs)
          break
        }
        case 'all': {
          const ps = addHandCard(select.card, 1)(handCards).state
          setHandCards(ps)
          break
        }
      }
      pushHistory()
      setIdle()

    }
  }

  const onDropToGoal = (gid: number, gpos: number) => {
    if (state.kind === 'select') {
      const select = state.select
      switch (select.kind) {
        case 'premise': {
          const [ps, gs] = moveFromTo(
            premises, onIndex(select.pid, deleteCardAt(select.ppos)), 
            goals, card => onIndex(gid, onGoalJson(insertCardTo(card, gpos)))
          )
          setPremises(ps)
          setGoals(gs)
          break
        } 
        case 'hand': {
          const [hcs, gs] = moveFromTo(
            handCards, getAHandCard(select.hpos), 
            goals, card => onIndex(gid, onGoalJson(insertCardTo(card, gpos)))
          )
          setHandCards(hcs)
          setGoals(gs)
          break
        }
        case 'goal': {
          const gs = moveWithin(
            goals, 
            onIndex(select.gid, onGoalJson(deleteCardAt(select.gpos))), 
            card => onIndex(gid, onGoalJson(insertCardTo(card, gpos)))
          )
          setGoals(gs)
          break
        }
        case 'all': {
          const gs = onIndex(gid, onGoalJson(insertCardTo(select.card, gpos)))(goals).state
          setGoals(gs)
          break
        }
      }
      pushHistory()
      setIdle()
    }
  }

  const onDropToAllCards = () => {
    if (state.kind === 'select') {
      const select = state.select
      switch (select.kind) {
        case 'premise': {
          const ps = onIndex(select.pid, deleteCardAt(select.ppos))(premises).state
          setPremises(ps)
          break
        } 
        case 'hand': {
          const hcs = deleteHandCard(select.hpos)(handCards).state
          setHandCards(hcs)
          break
        }
        case 'goal': {
          const gs = onIndex(select.gid, onGoalJson(deleteCardAt(select.gpos)))(goals).state
          setGoals(gs)
          break
        }
        case 'all': {
          break
        }
      }
      pushHistory()
      setIdle()
    }
  }

  // misc actions
  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setShowDrawer(open)
  } 

  const toggleConfirm = () => {
    if (logins.user === undefined) {
      alert("You need to login first!")
      logins.onLogin()
    } else if (goals.length > 0 
      && goals.map(g => getExprFromJson(g)).every(expr => parsePremiseSafe(expr) !== undefined)
      && handCards.length > 0) {
        setOnConfirm(true)
    } else {
      alert("This is not a valid level!")
    }
  }

  // post to server
  const postJsonToServer = () => {
    const data = {
      user: logins.user,
      level: evictJson() 
    }
    setOnSubmit(true)
    Axios.post(Paths.submitLevelJson, data)
      .then(() => alert("Submission successful!"))
      .catch(err => alert(err))
      .finally(() => {
        setOnSubmit(false)
        setOnConfirm(false)
      })
  }

  // rendering

  const renderAppBar = () => <AppBar position="static">
    <Toolbar style={{ backgroundColor: '#F2994A'}}>
      <Typography variant="h6" className={classes.title}>
        {title}
        <Tooltip title="Edit level name and description" arrow>
          <IconButton onClick={() => setChangeDesc(true)}>
            <EditIcon/>
          </IconButton>
        </Tooltip>
      </Typography>
      <IconButton 
        edge="start" 
        className={classes.menuButton} 
        color="inherit" 
        aria-label="menu"
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={isShowDrawer} onClose={toggleDrawer(false)}>
        {renderDrawerContent()}
      </Drawer>
    </Toolbar>
  </AppBar>

  const renderDrawerContent = (): JSX.Element => {
    const menu = <div>
      <List>
        <LinkContainer to='/'>
          <ListItem button key="menu" onClick={() => {}}>
            <ListItemText primary="Back to Main Menu"/>
          </ListItem>
        </LinkContainer>
      </List>
    </div>
    return menu
  }

  const renderPremise = (i: number) => <EditorPremise 
    category={{ kind: 'premise', index: i }} 
    scale={1} 
    onLock={() => setLockPremise(i)}
    onSelect={ppos => setSelect({ kind: 'premise', pid: i, ppos: ppos })}
    onDrop={ppos => onDropToPremise(i, ppos)}
  />

  const renderPremises = () => premises.map((_, i) => renderPremise(i))

  const renderHand = () => <EditorHand
    onPick={hpos => setSelect({ kind: 'hand', hpos: hpos})}
    onClickOnTag={setOpenHandCardEditor}
    onDrop={onDropToHand}
  />

  const renderModifyCardCount = () => 
    <EditorModifyCardCountDialogue
      hpos={onModifyCardPos}
      onSubmit={c => {
        setHandCardCount(onModifyCardPos, c)
      }}
    />  

  const renderGoal = () => <GridListTile>
    <EditorGoal
      isSuccessful={isSuccess}
      onSelect={(gid, gpos) => setSelect({ kind: 'goal', gid: gid, gpos: gpos})}
      onDrop={onDropToGoal}
      onChange={gid => setState({ kind: 'changeGoal', gid: gid, newGoal: goals[gid] })}
    />
  </GridListTile>

  const renderGoals = () => {
    return <div>
      {renderGoal()}
      <div style={{ width: '40', textAlign: 'left', marginBottom: '20px', marginRight: '70px', position: 'absolute', right: '0'}}>
        <Tooltip title="Add a new goal" aria-label="add" arrow>
          <Fab style={{ left: 40, backgroundColor: '#F2994A', color:'#fff' }} onClick={setAddGoal}>
            <AddIcon style={{ fontSize: '30' }}/>
          </Fab>
        </Tooltip>
        <Tooltip title="Delete the last goal" aria-label="del" arrow>
          <Fab 
            style={{ left: 40, backgroundColor: '#A359A3', color:'#fff', margin: '20px' }} 
            onClick={() => setRemoveGoal(goals.length - 1)}
          >
            <RemoveIcon style={{ fontSize: '30' }}/>
          </Fab>
        </Tooltip>
      </div>
      <ChangeGoalDialogue
        updateGoal={g => setState({kind: 'changeGoal', gid: state.kind == 'changeGoal' ? state.gid : -1, newGoal: g })}
        confirmGoal={() => {
          if (state.kind == 'changeGoal') {
            setModifyGoal(state.gid, state.newGoal)
          }
        }}
        deleteGoal={gid => setRemoveGoal(gid)}
      />
    </div>
  }

  const renderTruthTable = () => (
    <Dialog 
      open={isShowTruthTable} 
      onClose={() => setShowTruthTable(false)} 
      title="Truth Table"
    >
      <TruthTable premises={premises}/>
    </Dialog>
  )

  const renderAllCardsList = () => <EditorAllCards
    onSelect={c => setSelect({ kind: 'all', card: c })}
    onDrop={onDropToAllCards}
  />

  const renderConfirmation = () => 
    <Dialog open={onConfirm} onClose={() => setOnConfirm(false)}>
      <DialogTitle>Submit</DialogTitle>
      <DialogContent>
        Are you sure you want to submit your level?
        <GridList cols={1} style={{ width: '300px', height: '200px', marginTop: '10px'}}>
          <GridListTile>
            <TextField
              id="outlined-read-only-input"
              label="Level Setup in JSON"
              multiline
              defaultValue={JSON.stringify(evictJson())}
              InputProps={{
                readOnly: true,
              }}
              style={{ marginTop: '20px'}}
              variant="outlined"
              fullWidth
            />
          </GridListTile>
        </GridList>
      </DialogContent>
      <Divider/>
      <div>{ onSubmit ? <LinearProgress /> : undefined }</div>
      <DialogActions>
        <MButton onClick={postJsonToServer}>Confirm</MButton>
      </DialogActions>
    </Dialog>

  const renderFooter = () => <BottomNavigation
    value={0}
    showLabels
    className={classes.root}
    style={{
      width: '100%',
      position: 'sticky',
      bottom: 0,
    }}
  > 
    <MButton startIcon={<UndoIcon/>} onClick={undoHistory}>UNDO ONE STEP</MButton>  
    <MButton startIcon={<HelpIcon/>} onClick={() => setShowHelp(true)}>HELP</MButton>  
    <MButton startIcon={<EditIcon/>} onClick={() => setChangeDesc(true)}>EDIT DESCRIPTION</MButton>  
    <MButton startIcon={<FeedbackIcon/>} onClick={() => setShowTruthTable(true)}>SHOW TRUTH TABLE</MButton>  
    <MButton startIcon={<PublishIcon/>} onClick={toggleConfirm}>SUBMIT</MButton>  
  </BottomNavigation>

const setNextTutorial = () => {
  if (tutorialIndex < tutorials.length - 1) {
    setTutorialIndex(tutorialIndex + 1)
  } else {
    setTutorialIndex(0)
    setShowHelp(false)
  }
}

const setPrevTutorial = () => {
  if (tutorialIndex !== 0) {
    setTutorialIndex(tutorialIndex - 1)
  }
}

  return (
    <EditorContext.Provider value={{
      state: state,
      premises: premises,
      handCards: handCards,
      goals: goals,
      lockedPremises: lockedPremises,
      goalTrees: goalTrees,
      setIdle: setIdle
    }}>
      <div>
        {renderAppBar()}
        {renderPremises()}
        <Divider style={{ margin: '10px' }}/>
        <Grid container>
          <Grid item xs={4}>
            <GridList cols={1} style={{ flexWrap: 'nowrap', transform: 'translateZ(0)', height: '220px'}}>
              {renderGoals()}
            </GridList>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs={4}>
            <GridList cols={1} style={{ flexWrap: 'nowrap', transform: 'translateZ(0)', height: '220px'}}>
              {renderHand()}
            </GridList>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item alignContent='center'>
            {renderAllCardsList()}
          </Grid>
        </Grid>
        {renderFooter()}
        {renderConfirmation()}
        {renderModifyCardCount()}
        {renderTruthTable()}
        <DescEditorDialogue
          open={isChangeDesc}
          title={title}
          desc={desc}
          onSubmit={(title, desc) => {
            setTitle(title)
            setDesc(desc)
          }}
          onCancel={() => setChangeDesc(false)}
        />
      </div>
      <Dialog open={isShowHelp} onClose={() => setShowHelp(false)}>
          <DialogTitle style={{width:"1000px"}}>Tutorials</DialogTitle>
          <DialogContent>
            <Form>
              <Form.Label>{tutorials[tutorialIndex]}</Form.Label>
            </Form>
          </DialogContent>
          <DialogActions>
            <Button onClick={setPrevTutorial} style={{marginRight:"38%", backgroundColor: tutorialIndex == 0 ? '#CCC' : "#307df7", borderWidth:"0px"}}>←</Button>
            <div style={{marginRight:"38%"}}>{tutorialIndex + 1}/{tutorials.length}</div>
            <Button onClick={setNextTutorial} style={{marginRight:"2%", backgroundColor: tutorialIndex == tutorials.length - 1 ? '#CCC' : "#307df7", borderWidth:"0px"}}>→</Button>
          </DialogActions>
        </Dialog>
    </EditorContext.Provider>
  )
  
}