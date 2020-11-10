import React from 'react'
import { LevelsFilter } from '../../types';

interface ArenaContexts {
  filters: LevelsFilter[]
}

export const ArenaContext = React.createContext<ArenaContexts>({
  filters: [{ kind: 'likes' }]
})