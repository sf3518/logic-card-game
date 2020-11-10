import React from 'react'
import { Premise, Card } from '../../types'
import { parsePremiseSafe } from '../../server/gameApp/game/premise'
import { genTruthTableInStringForBTrees } from '../../server/gameApp/logicResolver/plainResolver'
import Table from 'react-bootstrap/Table'

interface Props {
  premises: Premise[]
}

export const TruthTable = ({
  premises
}: Props) => {
  const allVarsSet: Set<Card> = new Set()
  premises.forEach(p => p.filter(c => ["A", "B", "C", "D"].includes(c)).forEach(c => allVarsSet.add(c)))
  const allVars = Array.from(allVarsSet)
  const btrees = premises.map(p => parsePremiseSafe(p, allVars))
  const table = genTruthTableInStringForBTrees(allVars, btrees)
  return <Table>
    <thead>
      {table.headers.map(it => <td style={{ paddingTop: "0.25rem", paddingBottom: "0.25rem", }}>{it}</td>)}
    </thead>
    {table.body.map(row => <tr>
      {row.map(it => <td style={{ paddingTop: "1px", paddingBottom: "1px", }}>{it}</td>)}
    </tr>)}
  </Table>
}
