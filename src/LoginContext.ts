import React from 'react'
import { UserInfo } from './types'

interface LoginContexts {
  user: UserInfo | undefined
  toggleSetUser: (user: UserInfo | undefined) => void
  toggleLogout: () => void
  onLogin: () => void
  onSignup: () => void
  onHide: () => void
  onLogout: () => void
  passLevel: (lid: number) => void
}

export const LoginContext = React.createContext<LoginContexts>({
  user: undefined,
  toggleSetUser: _ => {},
  toggleLogout: () => {},
  onLogin: () => {},
  onSignup: () => {},
  onHide: () => {},
  onLogout: () => {},
  passLevel: _ => {}
})