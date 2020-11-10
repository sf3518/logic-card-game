import React, { useState, useEffect } from 'react'
import { PremiseComponent } from './Premise'
import { HandCardAreaComponent } from './HandCard'
import { Premise, GameView, GameAction, Card } from '../../types'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DiscardArea } from './DiscardArea'
import Axios, { AxiosRequestConfig } from 'axios'
import SocketIOClient from 'socket.io-client'
import { Paths, SocketEvents } from '../../routesPaths'
import { doActionToView, playHandCardTo, getGoalStates } from '../../game/views'
import { Table } from 'react-bootstrap'
import Context from './gameContext'
import { playCardsToAction, discardAction } from '../../game/actions'
import { variable } from '../../server/gameApp/logicResolver/bools'
import { GoalsComponent } from './Goals'

interface GameBoardProps {
  gameID: number
  playerVar: string
}

function initialGameView(playerVar: string): GameView {
  return { 
    playerVar: playerVar,
    handCardWithCount: [],
    discardPile: [],
    premises: [],
    deckCount: 0,
    goals: [{ kind: 'prove', expr: [playerVar as Card], boolTree: variable(playerVar) }]
  }
}


// Game board
const GameBoardComponent = (props: GameBoardProps) => {
  // Actions been taken in this round
  const [actions, setActions] = useState([] as GameAction[])
  // Which hand card is selected at now 
  // -1 if no card is selected
  const [handSelected, setHandSelected] = useState(-1)
  // History of views in this round
  const [historyViews, setHistoryViews] = useState([initialGameView(props.playerVar)] as GameView[])
  // socket.io end-point
  const [endpoint, setEndpoint] = useState('localhost:5000')

  const view = historyViews[historyViews.length - 1]

  const [goalStates, setGoalStates] = useState(view.goals.map(it => false))

  // Refresh from server at the very beginning
  useEffect(() => {
    // socket.on("get_data", data => {})
    refreshFromServer()
    const socket: SocketIOClient.Socket = SocketIOClient(endpoint)
    socket.on(SocketEvents.refreshGameState, (data: GameView | undefined) => {
      if (data) {
        clearHistory()
        setHistoryViews([data])
      } else {
        clearHistory()
      }
    })
  }, [])

  const unselectHandCard = () => setHandSelected(-1)

  const pushAction = (action: GameAction) => {
    setActions(actions.concat(action))
  }

  const popAction = () => {
    setActions(actions.slice(0, actions.length - 1))
  }

  const pushHistoryView = (view: GameView) => {
    setHistoryViews(historyViews.concat(view))
    setGoalStates(getGoalStates(view))
  }

  const popHistoryView = () => {
    setHistoryViews(historyViews.slice(0, historyViews.length - 1))
  }

  const doAction = (action: GameAction) => {
    const newView = doActionToView(view, action)
    pushAction(action)
    pushHistoryView(newView)
    unselectHandCard()
  }

  const undoAction = () => {
    if (actions.length > 0) {
      popAction()
      popHistoryView()
    }
  }

  const clearHistory = () => {
    while (actions.length > 0) {
      undoAction()
    }
  }

  // Post all actions to the server  ( actions + view -> server -> nextPlayer )
  // Playing state => Pending state
  function postActionsToServer() {
    const data = {
      gameID: props.gameID,
      playerVar: props.playerVar,
      actions: actions,
      view: view
    }

    Axios.post(Paths.gameAction, data)
      .then(res => setHistoryViews([res.data]))

  }

  // Get an update from the server
  // [Pending] => [Playing] << If server decides it's your turn
  //           => [Pending] << If server decides it's not your turn
  function refreshFromServer() {
    const config: AxiosRequestConfig = {
      params: {
        gameID: props.gameID,
        playerVar: props.playerVar
      }
    }
    Axios.get(Paths.gameUpdateView, config)
      .then(res => {
        console.log(res.data);
        setHistoryViews([res.data])        
      })
  }

  const renderPremises = (): JSX.Element => {
    const result: JSX.Element[] = []
    for (let i = 0; i < view.premises.length; i++) {
      const [premise, isLocked] = view.premises[i]
      result.push(
        <PremiseComponent 
          cards={premise} 
          scale={1}
          isLocked={isLocked}
          isProofPremise={false}
          premiseIndex={i} 
        />
      )
    }
    return (
      <Table striped bordered hover>
        {result.map(it => <tr>{it}</tr>)}
      </Table>
    )
  }

  const renderHandCardArea = (): JSX.Element => {
    return <HandCardAreaComponent
      playerVar={props.playerVar}
      cards={view.handCardWithCount}
    />
  }

  const renderGoals = (): JSX.Element => {
    return <GoalsComponent goals={view.goals} isSuccessful={goalStates} ></GoalsComponent>
  }

  return(
    <DndProvider backend={HTML5Backend}>
      <Context.Provider value={{
          playerVar: props.playerVar,
          handSelected: handSelected,
          handCardSelected: handSelected >= 0 ? view.handCardWithCount[handSelected][0] : undefined,
          unselectHand: unselectHandCard,
          pickHandCardCallback: (handIndex: number) => {
            setHandSelected(handIndex)
          },
          moveHandCardToPremise: (premiseId: number, inPremiseIndex: number) => {
            doAction(playCardsToAction(props.playerVar, handSelected, [premiseId, inPremiseIndex]))
          },
          discardPickedHandCard: () => {
            doAction(discardAction(props.playerVar, handSelected))
          }
      }}>
        <div className="status"></div>
          {renderPremises()}
        <div>
          {renderHandCardArea()}
        </div>
        <button onClick={() => postActionsToServer()}>post</button>
        <button onClick={() => alert(JSON.stringify(view))}>view</button>
        <button onClick={refreshFromServer}>refresh</button>
        <button onClick={undoAction}>Undo</button>
        <div>
          <DiscardArea actionOnDrop={() => alert("drop")}/>
        </div>
        {renderGoals()}
      </Context.Provider>
    </DndProvider>
  )

}

export { GameBoardComponent }