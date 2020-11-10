import React, { useState, useEffect } from 'react'
import { ArenaNavBar } from './ArenaNavBar'
import { ArenaContext } from './arenaContext'
import { LevelsFilter, LevelView } from '../../types'
import { ArenaMainBoard } from './ArenaMainBoard'
import Axios, { AxiosRequestConfig } from 'axios'
import { Paths } from '../../routesPaths'

export const Arena = (): JSX.Element => {

  const [filters, setFilters] = useState<LevelsFilter[]>([])
  const [levels, setLevels] = useState<LevelView[]>([])
  const [isLoading, setLoading] = useState(true)

  const setAddFilter = (filter: LevelsFilter) => setFilters(filters.concat(filter))

  const setRemoveFilter = (i: number) => setFilters(filters.filter((_, j) => i === j))

  const setClearFilters = () => setFilters([])

  const setAddLevels = (ls: LevelView[]) => setLevels(levels.concat(ls))

  const setClearLevels = () => setLevels([])

  const fetchMore = () => {
    setLoading(true)
    const config: AxiosRequestConfig = {
      params: { count: 10, offset: levels.length }
    }
    Axios.get<LevelView[]>(Paths.fetchNewLevels, config)
      .then(res => res.data)
      .then(res => {
        if (res.length == 0) {
          alert("No more levels can be found")
        }
        setAddLevels(res)
      })
      .then(_ => setLoading(false))
      .catch(err => {
        alert(err)
        setLoading(false)
      })
  }

  // Initial fetching
  useEffect(fetchMore, [])


  return (
    <ArenaContext.Provider value={{ filters: filters }}>
    <ArenaNavBar/>
    <ArenaMainBoard
      onShowMore={fetchMore}
      levels={levels}
      isLoading={isLoading}
    />
    </ArenaContext.Provider>
  )
} 