const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const host = 'localhost';
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('username set', (username) => {
        if (username) {
            socket['username'] = username;
            console.log('username ' + username + ' set')
            socket.broadcast.emit('user connected', '<p><b>' + username + '</b> ' + 'connected</p>')
            socket.emit('username accepted', '')
        }
    })

    socket.on('chat message', (msg) => {
        if (socket['username']) {
            socket.broadcast.emit('chat message', '<p><b>' + socket['username'] + '</b>: ' + msg + '</p>');
            socket.emit('chat message', '<p><b style="color:#993333">' + socket['username'] + '</b>: ' + msg + '</p');
        }
        else {
            socket.emit('error', 'username not set')
            console.log('user tried to send message, but did not set username')
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (socket['username']) {
            io.emit('user disconnected', '<p><b>' + socket['username'] + '</b> disconnected</p>')
        }
    });
});

server.listen(3000, () => {
    console.log('listening on localhost:3000');
});