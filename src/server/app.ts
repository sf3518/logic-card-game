import * as Http from 'http'
import Path from 'path'
import Express, { Request, Response } from 'express'
import { GameView } from '../types'
import indexRouter from './routes'
import http from 'http'
import SocketIO from 'socket.io'

export const port = process.env.PORT || '5000'


const app = Express()
app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))
app.use(Express.static(__dirname + "/../../build"))


app.use('/', indexRouter)

app.set('port', port);

export const server = http.createServer(app)

export const io = SocketIO(server)


export default app
