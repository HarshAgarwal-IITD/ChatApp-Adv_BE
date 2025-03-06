"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let count = 0;
let allSockets = [];
wss.on('connection', (socket) => {
    count++;
    console.log('userConnected', count);
    socket.on('message', (message) => {
        var _a;
        const parsedMsg = JSON.parse(message);
        if (parsedMsg.type === 'join') {
            allSockets.push({ socket, room: parsedMsg.payload.roomId });
            socket.send('successfully joined ' + parsedMsg.payload.roomId);
        }
        if (parsedMsg.type == 'chat') {
            let currentUserRoom = (_a = allSockets.find((s) => s.socket == socket)) === null || _a === void 0 ? void 0 : _a.room;
            console.log(parsedMsg);
            const userMessage = parsedMsg.payload.message;
            if (!currentUserRoom) {
                socket.send('plz join a room first');
            }
            else {
                allSockets.forEach((u) => {
                    if (u.room == currentUserRoom)
                        u.socket.send(userMessage);
                });
            }
        }
    });
});
