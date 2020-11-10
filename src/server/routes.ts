import Express, { json } from 'express'
import pool from './db'
import Path from 'path'
import { PostAction, UserCredential, LoginCredential, UserResponse, LevelSetupJsonFormat, LevelView, LevelResponse, UserInfo } from '../types'
import { GameApp } from './gameApp/gameApp'
import { Paths, SocketEvents } from '../routesPaths'
import { io } from './app'
import { constructLevel, levelPageInfo, findLevelSID, fromArenaSetup, allLevelPageInfos } from './gameApp/game/levels'
import fs from 'fs'

const router = Express.Router()
const gameApp = new GameApp()
gameApp.registerAGameByID(100, 4)

const sanitize = (input: string) => {
  return input.replace(';', ":")
}

/*
 * Account related operations
 */

//  POST: create a new user profile and insert to database
router.post(Paths.userRegister, (req, res, next) => {
  const profile: UserCredential = req.body
  const values = [
    profile.username,
    profile.email,
    profile.password
  ]
  
  console.log(JSON.stringify(values))

  pool.query(`INSERT INTO drp_users(username, email, email_verified, password_hash, date_created)
              VALUES ($1, $2, false, $3, NOW());`,
              values)
      .then(qRes => pool.query(`SELECT * FROM drp_users WHERE username=$1;`, [profile.username]))
      .then(qRes => qRes.rows[0])
      .then(row => {
        const info: UserInfo = {
          uid: row.uid, 
          username: row.username, 
          email: row.email, 
          levelFinished: row.level_finished
        }
        res.json(info)
      })
      .catch(err => res.status(401).json("Register error"))

      // (qErr, qRes) => pool.query(`SELECT * FROM drp_users WHERE username=$1`, [profile.username],
      // (qErr2, qRes2) => {
      //   const info = qRes2.rows[0]
      //   res.json(info)
      // })
})

router.post(Paths.userLogin, (req, res, next) => {
  const profile: LoginCredential = req.body
  const username = profile.username
  const password = profile.password

  pool.query(`SELECT * FROM drp_users WHERE username=$1 AND password_hash=$2;`,
    [username, password],
  ).then(qRes => {
    const rows = qRes.rows
    let resp: UserResponse
    if (rows.length == 0) {
      return Promise.reject("username error")
    }
    pool.query(`UPDATE drp_users SET last_login=NOW() WHERE username=$1;`, [username])
    const info: UserInfo = {
      uid: rows[0].uid,
      username: rows[0].username,
      email: rows[0].email,
      levelFinished: rows[0].level_finished
    }
    res.json(info)
  }).catch(err => {
    res.status(401).send(err)
  })

})

//  GET: get a user's profile from database by email
router.get('/api/get/getUserProfileFromDbByEmail', (req, res, next) => {
  const email = req.query.email
  console.log(email)
  pool.query(`SELECT * FROM drp_users
              WHERE email=$1`, 
              [ email ])
      .then(qRes => res.json(qRes))
})

/*
 * Levels related
 */

router.get(Paths.levelPageInfo, (req, res, next) => {
  const data = req.query
  const uname: string = data.uname as string
  res.json(allLevelPageInfos())
})

router.get(Paths.levelRequest, (req, res, next) => {
  const data = req.query
  const levelID: number = Number(data.levelID)
  res.json([constructLevel(levelID), findLevelSID(levelID + 1)])
}) 

router.post(Paths.levelSubmit, (req, res, next) => {
  const data = req.body.params
  const lid = Number(data.lid)
  const uname = data.uname as string
  pool.query(`UPDATE drp_users SET level_finished=$1 WHERE username=$2`,[lid, uname])

})

router.get(Paths.levelSubmit, (req, res, next) => {
  const data = req.query
  const isSuccess: boolean = data.isSuccess === "true"
  
  // some sql operations
  res.json({ msg: isSuccess ? "congrats!" : "work harder!" })
})

router.get(Paths.levelBelongToSection, (req, res, next) => {
  const data = req.query
  const levelID: number = Number(data.levelID)
  res.json(findLevelSID(levelID))
})

/*
 * Editor related
 */

router.post(Paths.submitLevelJson, (req, res, next) => {
  const data = req.body
  const user: UserCredential = data.user
  const level: LevelSetupJsonFormat = data.level
  console.log(user, level);
  pool.query(`SELECT uid, username FROM drp_users WHERE username=$1;`, [user.username])
  .then(qRes => {
    if (qRes.rows.length == 0) {
      return Promise.reject("error")
    }
    const uid: number = qRes.rows[0].uid
    return uid
  })
  .then(uid => pool.query(`SELECT MAX(level_id) FROM drp_levels WHERE author=$1;`, [user.username])
    .then(qRes => qRes.rows[0].max ? 0 : qRes.rows[0].max as number + 1)

    .then(levelID => { console.log(levelID); return levelID })
    .then(levelID => pool.query(
       `INSERT INTO drp_levels(user_id, author, level_id, json_in_string, created_date)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT DO NOTHING;`, 
        [uid, user.username, levelID, JSON.stringify(level)]))
  ).then(qRes => res.json("success"))
  .catch(err => {
    console.log(err);
    res.status(401).json(err)
  })
})

/*
 * Arena Related
 */

// Fetch new levels from database to arena main page
router.get(Paths.fetchNewLevels, (req, res, next) => {
  const data = req.query
  const count: number = Number(data.count)
  const offset: number = Number(data.offset)
  if (count === NaN) {
    return res.status(401).json("Not a Number!") 
  }

  pool.query(`SELECT * FROM drp_levels ORDER BY likes DESC OFFSET ${offset} ROWS FETCH NEXT ${count} ROWS ONLY`,[])
    .then(qRes => qRes.rows)
    .then(rows => res.json(rows.map(row => { 
      const json: LevelSetupJsonFormat = JSON.parse(row.json_in_string)
      return { title: json.title, author: row.author, lid: row.lid , uid: row.user_id,  likes: row.likes, dislikes: row.dislikes } 
    })))

})

// Load the user-designed level by lid
router.get(Paths.getArenaLevelByLid, (req, res, next) => {
  const data = req.query
  const lid = Number(data.lid)
  if (lid === NaN) {
    return res.status(401).json("Not a Number!") 
  }

  pool.query(`SELECT json_in_string FROM drp_levels WHERE lid=$1`, [lid])
    .then(qRes => qRes.rows)
    .then(rows => {
      if (rows.length == 0) {
        return res.status(401).json("Can't find this lid")
      }
      const row = rows[0]
      const json: LevelSetupJsonFormat = JSON.parse(row.json_in_string)
      const response: LevelResponse = fromArenaSetup(json)
      res.json([response, -1])
    })
})

// get all levels that the user has created
router.get(Paths.userLevels, (req, res, next) => {
  const data = req.query
  const uid = Number(data.uid)
  pool.query(`SELECT * FROM drp_levels WHERE user_id=$1 ORDER BY likes DESC`,[uid])
    .then(qRes => qRes.rows)
    .then(rows => res.json(rows.map(row => { 
      const json: LevelSetupJsonFormat = JSON.parse(row.json_in_string)
      return { title: json.title, author: row.author, lid: row.lid, uid: uid, likes: row.likes, dislikes: row.dislikes } 
    })))
    .catch(err => {
      console.error(err)
      res.status(401).write("query failed")
    })

})

// get user's profile
router.get(Paths.userInfo, (req, res, next) => {
  const data = req.query
  const uid = Number(data.uid)
  pool.query(`SELECT * FROM drp_users WHERE uid=$1`,[uid])
    .then(qRes => qRes.rows)
    .then(res => {
      if (res.length == 0) {
        return Promise.reject("User not found!")
      } else {
        return res[0]
      }
    })
    .then(row => {
      const profile: UserInfo = {
        uid: uid,
        username: row.username,
        email: row.email,
        levelFinished: row.level_finished
      }
      res.json(profile)
    })
    .catch(err => {
      console.error(err)
      res.status(401).write("query failed")
    })

})


/*
 * Game related
 */

//  register a new game 
router.post('/api/post/game/new', (req, res, next) => {
  const data = req.body
  const playerCount: number = data.playerCount
  gameApp.registerAGame(playerCount)
})

//  receive action from user
router.post(Paths.gameAction, (req, res, next) => {
  
  const data: PostAction = req.body
  const gameID = data.gameID
  const playerVar = data.playerVar
  const actions = data.actions
  const view = data.view

  console.log("receiving actions from player, " + actions)

  const board = gameApp.updateGameBoard(gameID, board => board.runActionsForPlayer(playerVar, actions))
  const resultView = board?.viewOf(playerVar)

  io.emit(SocketEvents.refreshGameState, resultView)

  res.json(resultView)
})

// receive refresh view request from user
router.get(Paths.gameUpdateView, (req, res, next) => {
  const playerVar = req.query.playerVar as string
  const gameID = Number(req.query.gameID)

  const view = gameApp.getGameView(gameID, playerVar)
  
  res.json(view)
})

// Index page
if (process.env.NODE_ENV === 'production') {
  // Exprees will serve up production assets
  router.use(Express.static('../../build'));

  // Express serve up index.html file if it doesn't recognize route
  router.get('/', (req, res) => {
    res.sendFile(__dirname + "../../build/index.html")
  })
}

export default router