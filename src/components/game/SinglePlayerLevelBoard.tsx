import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router'
import { LevelBoardComponent } from './LevelBoard'
import Axios, { AxiosRequestConfig } from 'axios'
import { LevelResponse } from '../../types'
import { Paths } from '../../routesPaths'
import { LoginContext } from '../../LoginContext'

interface LevelBoardParams {
  sid: string
  levelID: string
}

const NO_NEXT = -1

export const SinglePlayerLevelBoard = () => {
  const logins = useContext(LoginContext)
  const params = useParams<LevelBoardParams>()

  const levelID = Number(params.levelID)
  console.log(levelID)

  const sid = params.sid
  const [init, setInit] = useState<LevelResponse|undefined>()
  const [nextSid, setNextSid] = useState<number>(NO_NEXT)
  
  const fetchInitLevelFromServer = () => {
    const available = (logins.user?.levelFinished ?? -20) + 1
    if (levelID <= available) {
      const config: AxiosRequestConfig = {
        params: {
          levelID: levelID,
        }
      }
      Axios.get<[LevelResponse, number]>(Paths.levelRequest, config)
        .then(res => res.data)
        .then(([res, nextSid]) => {
          setInit(res)
          setNextSid(nextSid)
        })
    }
  }

  useEffect(fetchInitLevelFromServer, [params, levelID])

  useEffect(fetchInitLevelFromServer, [])

  return (
    init ? <LevelBoardComponent
      title={`${init.title}`}
      description={init.description}
      initView={init.view}
      nextUrl={nextSid === NO_NEXT ? "" : `/level/${nextSid}/${levelID + 1}`}
      backUrl={`/levelPage/${sid}`}
      submit={() => logins.passLevel(levelID)}
    /> : <div>This level is still locked!</div>
  )
}