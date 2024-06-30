const express = require('express');
const http = require('http');
const cors =require('cors');
const socketio = require('socket.io');

const app = express();

const server = http.createServer(app);
const io = socketio(server,{
    cors :{
        origin:"*"
    }
})

io.on("connection",(socket)=>{
    console.log('New client connected');

    socket.on("chat",(data) =>{
        io.emit("chat",data)
    })

    socket.on("disconnect",()=>{
        console.log('Client disconnected');
    })
})

server.listen(3000,()=>{
    console.log('Server listening on port 3000');
})