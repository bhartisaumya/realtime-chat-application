import {WebSocket} from 'ws'


export interface IMessage {
    userId: string,
    targetUserId?: string,
    chatRoom?: string,
    text?: string,
    type: string
}

export class MessageHandler{
    private clients: Map<string, WebSocket>;
    private chatRoomClients: Map<string, Set<WebSocket>>

    constructor(){
        this.clients = new Map<string, WebSocket>
        this.chatRoomClients = new Map<string, Set<WebSocket>>

    }

    // register when connecting to the ws

    register(ws: WebSocket, message: IMessage){
        const {userId} = message
        console.log(`User Registerd: ${userId}`)
        
        this.clients.set(userId, ws)
    }

    // send private message to single user

    private(ws: WebSocket, message: IMessage){
        const {targetUserId, userId, text} = message

        if(!targetUserId)
            return

        const targetClient = this.clients.get(targetUserId)

        if(targetClient && targetClient.readyState === WebSocket.OPEN){
            targetClient.send(JSON.stringify({
                from: userId,
                text
            }))

        }
    }

    // send message to user present in the group

    group(ws: WebSocket, message: IMessage){
        const {chatRoom, userId, text} = message

        if(!chatRoom)
            return;

        const roomClients = this.chatRoomClients.get(chatRoom)

        if(!roomClients){
            console.log(`Created new chatRoom: ${chatRoom}`)

            this.chatRoomClients.set(chatRoom, new Set())
            this.chatRoomClients.get(chatRoom)?.add(ws)
        }
        else{
            roomClients.forEach((client: WebSocket) => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        from: userId,
                        text 
                    }))
                }
            })
        }
    }

    // send message to all the active user

    broadcast(ws: WebSocket, message: IMessage){
        const {userId, text} = message

        this.clients.forEach((client: WebSocket) => {
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({
                    from: userId,
                    text
                }))
            }
        })
    }

    // clear map when user disconnected

    userDisconnected(ws: WebSocket){
        // Remove the user from the clients
        this.clients.forEach((client, userId) => {
            if(client === ws){
                this.clients.delete(userId)
                console.log(`Client with usersID: ${userId} disconnected`)
            }

        })

        // Remove the user from chatroooms
        this.chatRoomClients.forEach((clients, roomId) => {
            clients.delete(ws)

            if(clients.size === 0)
                this.chatRoomClients.delete(roomId)
        })
    }
}
