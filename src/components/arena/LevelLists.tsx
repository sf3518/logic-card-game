import { Image, Table, Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import React, { useState, useEffect } from 'react'
import { LevelView } from '../../types'
import { LevelCard } from './LevelCard'
import Axios, { AxiosRequestConfig } from 'axios'

interface CardList {
  totalHeight: number,
  threadCards: JSX.Element[]
}

export const LevelLists = (): JSX.Element => {

  const emptyThreadCardList = (): CardList => { return {
    totalHeight: 0,
    threadCards: []
  }}

  const [lists, setLists] = useState([emptyThreadCardList(), emptyThreadCardList(), emptyThreadCardList()])

  // clone the current state, returns a new object which does not have any relation with the old state
  const cloneState = (): CardList[] => {
    return lists.map(({totalHeight, threadCards}) => { return {
        totalHeight: totalHeight,
        threadCards: threadCards.slice()
      }
    })
  }

  // Get the next index of the list which the next card should be placed at.
  const nextCardIndex = (adjustingLengths: number[]): number => {
    const lengthOf = (i: number): number => adjustingLengths[i] + lists[i].totalHeight
    let targetColumn = 0
    for (let i = 1; i < lists.length; i++) {
      if (lengthOf(i) < lengthOf(targetColumn)) {
        targetColumn = i
      }
    }
    return targetColumn
  }

  // Updates the fetched new views to the board
  const updateNewViews = (views: LevelView[]) => {
    const newState = cloneState()
    let adjustingLengths = newState.map(_ => 0)
    views.forEach(view => {
      const fetchToColumnIndex = nextCardIndex(adjustingLengths)
      adjustingLengths[fetchToColumnIndex] += viewLength(view)
      // update newState status
      newState[fetchToColumnIndex].threadCards.push(renderCard(view))
      newState[fetchToColumnIndex].totalHeight += viewLength(view)
    })
    setLists(newState)
  }

  // Refresh the current 
  const refresh = (count: number) => {
    Axios.get("/api/get/refreshPosts", { params: { count: count } })
      .then(res => res.data)
      .then(updateNewViews)
  } 

  const viewLength = (view: LevelView): number => view.title.length + view.author.length 

  const renderCard = (view: LevelView) => <LevelCard view={view}/>

  const renderColumn = (column: JSX.Element[]) => {
    return (
      <div className="board-col">
        {column}
      </div>
    )
  }

  return (
    <div>
      <table>
        <thead>
          <tr style={{ verticalAlign: 'top' }}>
            {lists.map(col => <th>{renderColumn(col.threadCards)}</th>)}
          </tr>
        </thead>
      </table>
      <Button onClick={() => refresh(3)}>Fetch!</Button>
    </div>
  )
}