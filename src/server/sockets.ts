import SocketIO from 'socket.io'
import { server, io } from './app'


io.on('connection', (socket: SocketIO.Socket) => {
  console.log(`A user connected! id=${socket.id}`)
  socket.on('disconnection', (data) => {
    console.log(data)
  }) 
})
