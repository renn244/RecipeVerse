import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'

const app = express()

const server = createServer(app)
const io = new Server(server)

// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// map is good for this as it can use the 2 values as key for each other


const userSocketMap = new Map()

export const getSocketId = (userId: string) => {
    return userSocketMap.get(userId)
}

export const getUserId = (socketId: string) => {
    return userSocketMap.get(socketId)
}

export const addUserId = (userId: string, socketId: string) => {
    return userSocketMap.set(userId, socketId)
}

export const deleteSocketId = (userId: string) => {
    return userSocketMap.delete(userId)
}

io.on('connection', (socket) => {

    const userId: any = socket.handshake.query.userId // getting the userId on the first contact(handshake) given by the client
    if(userId) addUserId(userId, socket.id)
    console.log(`[server]  ${userId} has connected`)
    // event listener for the server

    socket.on('disconnect', () => {
        console.log(`[server]  ${userId} has disconnected`)
        deleteSocketId(userId)
    })
})

export { app, server, io }