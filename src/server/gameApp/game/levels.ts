import { LevelResponse, LevelSetupJsonFormat, LevelPageInfo } from "../../../types";
import { not, variable } from "../logicResolver/bools";
import { LevelSetup } from "./levelSetup";
import Path from 'path'
import fs from 'fs'

export function constructLevel(levelID: number): LevelResponse {
  const fPath = `${Path.resolve("./levels")}/${levelID}.json`  
  const level: LevelSetupJsonFormat = require(fPath)
  const totalLevelsCount = levelPageInfos.map(([_, a]) => a).reduce((a, b) => a + b)
  return new LevelSetup(levelID, level, levelID > 1, levelID < totalLevelsCount).evictSetupResponse()
}

export function fromArenaSetup(fromJSON: LevelSetupJsonFormat): LevelResponse {
  return LevelSetup.arena(fromJSON).evictSetupResponse()
}

const levelPageInfos: [string, number][] = [
    ["I. Aristotle (384–322 BC)", 12],
    ["II. Bernard Bolzano (1781-1848)", 9],
    ["III. George Boole (1815-1864)", 9],
    ["IV. Georg Cantor (1845-1918)", 9],
    ["V. Giuseppe Peano (1858-1932)", 9],
    ["VI. David Hilbert (1862-1943)", 9],
    ["VII. Bertrand Russell (1872-1970)", 9],
    ["VIII. Thoralf Skolem (1887-1963)", 9],
    ["IX. Haskell Curry (1900-1982)", 9],
    ["X. Alfred Tarski (1901-1983)", 9],
    ["XI. Kurt Gödel (1906-1978)", 9],
]

export function allLevelPageInfos(): LevelPageInfo[] {
  return Array.from({length: levelPageInfos.length}, (_, i) => levelPageInfo(i)) 
}

export function levelPageInfo(sid: number): LevelPageInfo {
  const [title, count] = levelPageInfos[sid]
  let start = 1
  for (let i = 0; i < sid; i++) {
    const [_, c] = levelPageInfos[i]
    start += c
  }

  const allNumbers = Array(count).fill(0).map((_, j) => j + start)
  const unAvailables: number[] = allNumbers.filter(k => {
    const fpath = `${Path.resolve("./levels")}/${k}.json`
    return !fs.existsSync(fpath)
  })

  return {
    title: title,
    startID: start,
    levelsCount: count, 
    hasPrev: sid != 0,
    hasNext: sid != levelPageInfos.length - 1,
    unavailables: unAvailables
  }
}

export function findLevelSID(levelID: number): number {
  if (!fs.existsSync(`${Path.resolve("./levels")}/${levelID}.json`)) {
    return -1
  }
  let acc = 0
  for (let i = 0; i < levelPageInfos.length; i++) {
    const [_, count] = levelPageInfos[i]
    acc += count
    if (acc > levelID) {
      return i
    }
  }
  return -1
}