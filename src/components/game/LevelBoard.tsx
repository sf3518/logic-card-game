import React, { useState, useEffect, useRef } from 'react'
import { PremiseComponent } from './Premise'
import { HandCardAreaComponent } from './HandCard'
import { GameView, GameAction, Card, Premise } from '../../types'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Axios, { AxiosRequestConfig } from 'axios'
import { Paths } from '../../routesPaths'
import { doActionToView, getGoalStates, fixInfinityNumber } from '../../game/views'
import { Table, Button, Modal, Form } from 'react-bootstrap'
import Context from './gameContext'
import { playCardsToAction, discardAction } from '../../game/actions'
import { GoalsComponent } from './Goals'
import { LinkContainer } from 'react-router-bootstrap'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  makeStyles, 
  Button as MButton, 
  IconButton, 
  Container, 
  Grid, 
  Drawer,
  List, 
  Divider, 
  ListItem, 
  ListItemText, 
  BottomNavigation, 
  Dialog,
  Slide, 
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import UndoIcon from '@material-ui/icons/Undo'
import FeedbackIcon from '@material-ui/icons/Feedback'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'

import './Board.css'
import { TransitionProps } from '@material-ui/core/transitions/transition'
import { genTruthTableInStringForBTrees } from '../../server/gameApp/logicResolver/plainResolver'
import { parsePremiseSafe } from '../../server/gameApp/game/premise'
import { useStyles } from '../appbar'
import { TruthTable } from './Truthtable'
import TUTORIAL_1 from "../../src_img/tutorial/1.gif";
import TUTORIAL_2 from "../../src_img/tutorial/2.gif";
import TUTORIAL_3 from "../../src_img/tutorial/3.gif";
import { height } from '@material-ui/system'


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
})

const playAs: Card = "A"

interface Props {
  title: string
  description: string[]
  initView: GameView
  nextUrl: string
  backUrl: string
  submit: () => void
}

// Game board
const LevelBoardComponent = ({
  title,
  description,
  initView,
  nextUrl,
  backUrl,
  submit
}: Props) => {

  // Actions been taken in this round
  const [actions, setActions] = useState([] as GameAction[])
  // Which hand card is selected at now 
  // -1 if no card is selected
  const [handSelected, setHandSelected] = useState(-1)
  // History of views in this round
  const [historyViews, setHV] = useState([fixInfinityNumber(initView)])
  // Whether to show the right hand side drawer
  const [isShowDrawer, setShowDrawer] = useState(false)
  const [isShownSuccessDialogue, setShownSuccessDialogue] = useState(false)
  const [isShowTruthTable, setShowTruthTable] = useState(false)
  const [bottomNavIndex, setBottomNavIndex] = useState(0)
  
  // which description to display, if descIndex = description.length, no display
  const [descIndex, setDescIndex] = useState(description.length)

  const [view, setView] = useState(historyViews[historyViews.length - 1])

  const [goalStates, setGoalStates] = useState(view.goals.map(_ => false))

  const classes = useStyles()

  const [allVars, setAllVars] = useState<Card[]>([])

  // Refresh from server at the very beginning
  useEffect(() => {
    setDescIndex(0)
    setShownSuccessDialogue(false)
    setHistoryViews([fixInfinityNumber(initView)])
    setActions([])
  }, [nextUrl, initView])

  useEffect(() => {
    if (isSuccess()) {
      submit()
    }
  }, [goalStates])

  // Recalculate variables  
  useEffect(() => {
    const cards: Set<Card> = new Set()
    const addVars = (p: Premise) => p.filter(it => ["A", "B", "C", "D"].includes(it)).forEach(c => cards.add(c))
    view.premises.forEach(([p, _]) => addVars(p))
    addVars(view.handCardWithCount.map(([c, _]) => c))
    setAllVars(Array.from(cards))
  }, [historyViews])

  const isSuccess = () => goalStates.reduce((a, b) => a && b)

  const unselectHandCard = () => setHandSelected(-1)

  const setHistoryViews = (newViews: GameView[]) => {
    setHV(newViews)
    setGoalStates(getGoalStates(newViews[newViews.length - 1]))
    setView(newViews[newViews.length - 1])
  }

  const pushAction = (action: GameAction) => {
    setActions(actions.concat(action))
  }

  const popAction = () => {
    setActions(actions.slice(0, actions.length - 1))
  }

  const pushHistoryView = (view: GameView) => {
    setHistoryViews(historyViews.concat(view))
  }

  const popHistoryView = () => {
    setHistoryViews(historyViews.slice(0, historyViews.length - 1))
  }

  const doAction = async (action: GameAction) => {
    const newView = doActionToView(view, action)
    pushAction(action)
    pushHistoryView(newView)
    unselectHandCard()
  }

  const undoAction = async () => {
    if (actions.length > 0) {
      popAction()
      popHistoryView()
    }
  }

  const setNextDesc = () => {
    if (descIndex == description.length) {
      setDescIndex(0)
    } else {
      setDescIndex(descIndex + 1)
    }
  }

  const setPrevDesc = () => {
    if (descIndex == 0) {
      setDescIndex(description.length)
    } else {
      setDescIndex(descIndex - 1)
    }
  }

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

  const submitAnswerToServer = () => {
    const config: AxiosRequestConfig = {
      params: {
        isSuccess: isSuccess()
      }
    }
    Axios.get(Paths.levelSubmit, config)
      .then(res => {
        alert(res.data.msg);
      })
  }

  const renderSuccessDialogue =
    <Dialog
      open={!isShownSuccessDialogue && isSuccess()}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => setShownSuccessDialogue(true)}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
      style={{ color: 'green' }}
    >
      <DialogTitle id="alert-dialog-slide-title" style={{ color: 'green'}}>LEVEL PASSED!</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          You have completed this challenge!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <MButton onClick={() => setShownSuccessDialogue(true)} color="secondary">
          CLOSE
        </MButton>
        {nextUrl !== "" ? <LinkContainer to={nextUrl}>
          <MButton color="primary">
            NEXT LEVEL
          </MButton>
        </LinkContainer> : undefined}
      </DialogActions>
    </Dialog>

  const renderPremises = (): JSX.Element => {
    const result: JSX.Element[] = []
    for (let i = 0; i < 4; i++) {
      const [premise, isLocked] = view.premises[i] ?? [[], true]
      result.push(
        <PremiseComponent 
          cards={premise} 
          scale={1}
          isLocked={isLocked}
          isProofPremise={true}
          premiseIndex={i} 
        />
      )
    }
    if (view.premises.length == 1) {
      [result[0], result[1]] = [result[1], result[0]]
    } else if (view.premises.length == 2) {
      [result[1], result[2], result[0]] = [result[0], result[1], result[2]]
    }
    return (
      <Table striped hover>
        {result.map(it => <tr>{it}</tr>)}
      </Table>
    )
  }

  const renderHandCardArea = (): JSX.Element => {
    return <HandCardAreaComponent
      playerVar={playAs}
      cards={view.handCardWithCount}
    />
  }

  const renderGoals = (): JSX.Element => {
    return <GoalsComponent goals={view.goals} isSuccessful={goalStates} ></GoalsComponent>
  }

  const renderDrawerContent = (): JSX.Element => {
    const menu = <div>
      <List>
        <ListItem button key="sub" onClick={submitAnswerToServer}>
          <ListItemText primary="Submit"/>
        </ListItem>
      </List>
      <Divider/>
      <List>
        <LinkContainer to={backUrl}>
          <ListItem button key="levelPage" onClick={() => {}}>
            <ListItemText primary="Back to Level Page"/>
          </ListItem>
        </LinkContainer>
        <LinkContainer to='/'>
          <ListItem button key="menu" onClick={() => {}}>
            <ListItemText primary="Back to Main Menu"/>
          </ListItem>
        </LinkContainer>
      </List>
    </div>
    return menu
  }

  const renderTutorials = (): JSX.Element => {
    let img:object;
    switch (descIndex) {
      case 1: {
        img = <img src={TUTORIAL_1} width="500"/>;
        break
      }
      case 3: {
        img = <img src={TUTORIAL_2} width="500"/>;
        break
      }
      case 4: {
        img = <img src={TUTORIAL_3} width="500"/>;
        break
      }
      default: {
        img = <div/>
      }
    }
    const content = <div>
      {description[descIndex]}
      <div>{img}</div>
    </div>
    return content
  }

  return(
    <DndProvider backend={HTML5Backend}>
      <Context.Provider value={{
          playerVar: playAs,
          handSelected: handSelected,
          handCardSelected: handSelected >= 0 ? view.handCardWithCount[handSelected][0] : undefined,
          unselectHand: unselectHandCard,
          pickHandCardCallback: (handIndex: number) => {
            setHandSelected(handIndex)
          },
          moveHandCardToPremise: (premiseId: number, inPremiseIndex: number) => {
            doAction(playCardsToAction(playAs, handSelected, [premiseId, inPremiseIndex]))
          },
          discardPickedHandCard: () => {
            doAction(discardAction(playAs, handSelected))
          }
      }}>
        <AppBar position="static">
          <Toolbar style={{ backgroundColor: '#F2994A'}}>
            <Typography variant="h6" className={classes.title}>
              {title}
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
        <Container maxWidth="xl">
          {renderPremises()}
        </Container>
        <Divider/>

        <Container maxWidth="xl" style={{ marginTop: "20px" }}>
          <Grid container spacing={0}>
            <Grid item xs={6}>
              {renderHandCardArea()}
            </Grid>
            <Grid item xs={6}>
              {renderGoals()}
            </Grid>
          </Grid>
        </Container>
        <Divider/>
        {/* Navbar at the bottom */}
        <BottomNavigation
          value={bottomNavIndex}
          showLabels
          className={classes.root}
          style={{
            width: '100%',
            position: 'sticky',
            bottom: 0,
          }}
        > 
          <MButton startIcon={<UndoIcon/>} disabled={actions.length <= 0} onClick={undoAction}>UNDO ONE STEP</MButton>  
          <MButton disabled={description.length == 0}  startIcon={<FeedbackIcon/>} onClick={setNextDesc}>SHOW TUTORIALS</MButton>  
          <MButton startIcon={<FeedbackIcon/>} onClick={() => setShowTruthTable(true)}>SHOW TRUTH TABLE</MButton>  
          <LinkContainer to={nextUrl}>
            <MButton disabled={nextUrl === "" || !isSuccess()}  startIcon={<NavigateNextIcon/>}>NEXT LEVEL</MButton>  
          </LinkContainer>
        </BottomNavigation>
        {/* Pop-up hints */}
        <Dialog open={descIndex != description.length} onClose={() => setDescIndex(description.length)}>
          <DialogTitle style={{width:"1000px"}}>Tutorials</DialogTitle>
          <DialogContent>
            <Form>
              <Form.Label>{title === "1: Hello, world!" ? renderTutorials() : description[descIndex]}</Form.Label>
            </Form>
          </DialogContent>
          <DialogActions>
            <Button onClick={setPrevDesc} style={{marginRight:"38%", backgroundColor: descIndex == 0 ? '#CCC' : "#307df7", borderWidth:"0px"}}>←</Button>
            <div style={{marginRight:"38%"}}>{descIndex + 1}/{description.length}</div>
            <Button onClick={setNextDesc} style={{marginRight:"2%", backgroundColor: descIndex == description.length - 1 ? '#CCC' : "#307df7", borderWidth:"0px"}}>→</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isShowTruthTable} onClose={() => setShowTruthTable(false)}>
          <DialogTitle>Truth Table</DialogTitle>
          <DialogContent>
            {<TruthTable premises={view.premises.map(([p, _]) => p)}/>}
          </DialogContent>
        </Dialog>
        {renderSuccessDialogue}
      </Context.Provider>
    </DndProvider>
  )

}

export { LevelBoardComponent }