import express from 'express'
import {WebSocket, WebSocketServer} from 'ws'

import {IMessage, MessageHandler} from './messageHandler'

const app = express()

app.get('/foo', (req, res) => {
    res.send('bar')
})

const server = app.listen(8080)

const wss = new WebSocketServer({server})


const messageHandler = new MessageHandler()


wss.on('connection', (ws) => {

    ws.on('open', () => {
        console.log('Client connected...') 
    })

    ws.on('message', (data) => {
        const message: IMessage = JSON.parse(data.toString())

        switch(message.type){
            case 'register':
                messageHandler.register(ws, message)
                break;

            case 'privateMessage':
                messageHandler.private(ws, message)
                break;

            case 'roomMessage':
                messageHandler.group(ws, message)
                break;


            case 'broadcast':
                messageHandler.broadcast(ws, message)
                break;

            default:
                console.log(`Error in the message format: ${message}`)

        }
    })

    ws.on('close', () => {
        messageHandler.userDisconnected(ws)
    })
})






