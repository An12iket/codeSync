const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const cors = require("cors");

const server = http.createServer(app);
const io = new Server(server);

app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json()); // ✅ Fix: Parse JSON body
app.use(express.static('build')); // Serve static frontend files

// ✅ Fix: API Route should be ABOVE `sendFile()`
app.post('/run', (req, res) => {
    const { code, language } = req.body;
    console.log("Received code:", code);
    console.log("Language:", language);

    let fileName, command;
    switch (language) {
        case 'javascript':
            fileName = 'temp.js';
            command = `node ${fileName}`;
            break;
        case 'python':
            fileName = 'temp.py';
            command = `python3 ${fileName}`;
            break;
        case 'cpp':
            fileName = 'temp.cpp';
            command = `g++ ${fileName} -o temp.exe && temp.exe`;;
            break;
        case 'java':
            fileName = 'Main.java';
            command = `javac ${fileName} && java Main`;
            break;
        default:
            return res.json({ output: 'Unsupported language' });
    }

    fs.writeFileSync(fileName, code);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.json({ output: stderr || error.message });
        } else {
            res.json({ output: stdout });
        }
    });
});

// ✅ Fix: Move this BELOW API routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => ({
            socketId,
            username: userSocketMap[socketId],
        })
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
