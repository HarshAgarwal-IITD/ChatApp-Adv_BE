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
        let messageToSend = {
            type: '', message: ""
        };
        const parsedMsg = JSON.parse(message);
        if (parsedMsg.type == 'exit') {
            allSockets.filter(s => s.socket != socket);
            messageToSend.type = "dialogue";
            messageToSend.message = "successfully exited the room";
            socket.send(JSON.stringify(messageToSend));
        }
        if (parsedMsg.type === 'join') {
            allSockets.push({ socket, room: parsedMsg.payload.roomId });
            messageToSend.type = "dialogue";
            messageToSend.message = "successfully joined roomId: " + parsedMsg.payload.roomId;
            socket.send(JSON.stringify(messageToSend));
            console.log(messageToSend);
        }
        if (parsedMsg.type == 'chat') {
            let currentUserRoom = (_a = allSockets.find((s) => s.socket == socket)) === null || _a === void 0 ? void 0 : _a.room;
            console.log(parsedMsg);
            const userMessage = parsedMsg.payload.message;
            if (!currentUserRoom) {
                messageToSend.type = "dialogue";
                messageToSend.message = "join a room first to send messages";
                socket.send(JSON.stringify(messageToSend));
            }
            else {
                allSockets.forEach((u) => {
                    if (u.room == currentUserRoom && u.socket !== socket) {
                        messageToSend.type = "member";
                        messageToSend.message = userMessage;
                        u.socket.send(JSON.stringify(messageToSend));
                    }
                });
            }
        }
    });
});
