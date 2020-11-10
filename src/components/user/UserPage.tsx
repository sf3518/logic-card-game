import React, { useEffect, useState } from 'react'
import { UserInfo, LevelView } from '../../types'
import { UserPageNavBar } from './UserPageNavbar'
import { useParams } from 'react-router'
import Axios, { AxiosRequestConfig } from 'axios'
import { Paths } from '../../routesPaths'
import { UserPageProfile } from './UserPageProfile'
import { UserPageLevels } from './UserPageLevels'
import { Divider } from '@material-ui/core'

interface Params {
  uid: string
}

export const UserPage = () => {

  const { uid } = useParams()
  const [user, setUser] = useState<UserInfo>({ uid: 0, username: "", email: "", levelFinished: 0 })
  const [levels, setLevels] = useState<LevelView[]>([])

  const fetchUserInfo = () => {
    const config: AxiosRequestConfig = {
      params: { uid: Number(uid) }
    }
    Axios.get<UserInfo>(Paths.userInfo, config)
      .then(res =>  res.data)
      .then(setUser)
      .catch(alert)
  }

  const fetchLevels = () => {
    const config: AxiosRequestConfig = {
      params: { uid: uid }
    }
    Axios.get<LevelView[]>(Paths.userLevels, config)
      .then(res => res.data)
      .then(setLevels)
      .catch(alert)
  }

  useEffect(() => {
    fetchUserInfo()
    fetchLevels()
  }, [uid])

  return (
    <div>
      <UserPageNavBar/>
      <UserPageProfile profile={user}/>
      <Divider  style={{ margin: "40px" }}/>
      <UserPageLevels levels={levels}/>
    </div>
  )
}