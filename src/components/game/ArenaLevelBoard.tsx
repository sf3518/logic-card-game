import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { LevelBoardComponent } from './LevelBoard'
import Axios, { AxiosRequestConfig } from 'axios'
import { LevelResponse } from '../../types'
import { Paths } from '../../routesPaths'

interface LevelBoardParams {
  lid: string
}


export const ArenaLevelBoard = () => {
  const params = useParams<LevelBoardParams>()
  const lid = params.lid
  const [init, setInit] = useState<LevelResponse|undefined>()
  
  const fetchInitLevelFromServer = () => {
    const config: AxiosRequestConfig = {
      params: {
        lid: lid,
      }
    }
    Axios.get<[LevelResponse, number]>(Paths.getArenaLevelByLid, config)
      .then(res => res.data)
      .then(([res, _]) => {
        setInit(res)
      })
  }

  useEffect(fetchInitLevelFromServer, [])

  return (
    init ? <LevelBoardComponent
      title={`${init.title}`}
      description={init.description}
      initView={init.view}
      nextUrl=""
      backUrl={`/arena`}
      submit={() => {}}
    /> : <div></div>
  )
}