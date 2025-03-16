"use strict";
// import { WebSocketServer,WebSocket } from "ws";
// import { UserModel,RoomModel } from "../db";
// import { socketToMember, SocketToMembers,socketToMessages } from "../instances/instances";
// import jwt from "jsonwebtoken";
// import dotenv from 'dotenv'
// import mongoose from "mongoose";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocketServer = void 0;
// dotenv.config();
// interface AuthenticatedClient extends WebSocket {
//     userId?: string;
//     username?: string;
//   }
// interface userMessageFormat{
//   type:string,
//   payload:{
//     roomId:string,
//     message:string
//   }
// }
// const activeRooms = new Map<string, Set<WebSocket>>();
// const unsavedMessages = new Map<string, { message: string; userId: string }[]>();
// const JWT_SECRET = process.env.JWT_SECRET;
// export const setupWebSocketServer = (server: any) => {
//     const wss = new WebSocketServer({ server });
//     wss.on("connection", (ws: AuthenticatedClient, req) => {
//       const token = req.headers.cookie?.split("=")[1]; // Extract JWT token from cookie
//       console.log(token)
//       if (!token) {
//         let messageToSend={
//             type:'',message:""
//         }
//         messageToSend.type="dialogue";
//         messageToSend.message="plz join a room to send messages ";
//         ws.send(JSON.stringify(messageToSend));
//         ws.close();
//         return;
//       }
//       try {
//         const decoded = jwt.verify(token, JWT_SECRET || "SECRET") as { userId: string; username: string };
//         ws.userId = decoded.userId;
//         ws.username = decoded.username;
//         ws.send(JSON.stringify({ message: `Welcome ${ws.username}` }));
//         ws.on('message',async (message:String)=>{
//             console.log(`Message from ${ws.username}:`, message.toString());
//             let messageToSend={
//                 type:'',message:""
//             }
//             let parsedMsg:userMessageFormat ;
//             try
//            { 
//             parsedMsg= JSON.parse(message as unknown as string);
//           }
//           catch(e){
//             ws.send(
//               JSON.stringify({
//                 type: "error",
//                 message: "Invalid message format",
//               })
//             );
//             return;
//           }
//             const roomId= parsedMsg.payload.roomId;
//             const type = parsedMsg.type;
//             const userMessage=parsedMsg.payload.message;
//           //roomId is roomName acc to db for user friendly expreience
//             if (roomId) {
//               // If room is not in cache → Check DB and add to cache
//               if (!activeRooms.has(roomId)) {
//                 const room = await RoomModel.findOne({roomName:roomId});
//                 if (!room) {
//                   messageToSend.type = "dialogue";
//                   messageToSend.message = "Room does not exist";
//                   ws.send(JSON.stringify(messageToSend));
//                   return;
//                 }
//                 // ✅ Check if user is a member of the room
//                 if (!room.members.includes( new mongoose.Types.ObjectId(ws.userId))) {
//                   messageToSend.type = "dialogue";
//                   messageToSend.message = "You are not a member of this room";
//                   ws.send(JSON.stringify(messageToSend));
//                   return;
//                 }
//                 // ✅ Create a cache entry for the room and an empty set in initialized
//                 activeRooms.set(roomId, new Set());
//               }
//               // ✅ Now directly update the cache (no DB hit after first time)
//               activeRooms.get(roomId)?.add(ws);
//               //
//               console.log(`User ${ws.username} added to room ${roomId}`);
//             }
//            //message handling
//             if(parsedMsg.type=='chat' && roomId){
//               if (!unsavedMessages.has(roomId)) {
//                 unsavedMessages.set(roomId, []);
//               }
//               unsavedMessages.get(roomId)?.push({ message: userMessage, userId: ws.userId || '' });
//               // Broadcast to all connected users in the same room
//               activeRooms.get(roomId)?.forEach((client) => {
//                 if (client !== ws) {
//                   client.send(
//                     JSON.stringify({ type: 'chat', username: ws.username, message: userMessage })
//                   );
//                 }
//               });
//             }
//           })
//           ws.on('close', () => {
//             console.log(`User ${ws.username} disconnected`);
//             // ✅ Remove from activeRooms
//             activeRooms.forEach((clients, roomId) => {
//               if (clients.has(ws)) {
//                 clients.delete(ws);
//                 console.log(`User ${ws.username} removed from room ${roomId}`);
//               }
//               // ✅ If room is empty, clean it up
//               if (clients.size === 0) {
//                 activeRooms.delete(roomId);
//                 console.log(`Room ${roomId} removed from cache`);
//               }
//             });
//           });
//       } catch (err) {
//         ws.close();
//       }
//     });
//     setInterval(async () => {
//       for (const [roomId, messages] of unsavedMessages) {
//         if (messages.length > 0) {
//           const room = await RoomModel.findOne({roomName:roomId});
//           if (room) {
//             // ✅ Format messages to match the schema before saving
//             const formattedMessages = messages.map((msg) => ({
//               message: msg.message,
//               member: new mongoose.Types.ObjectId(msg.userId), // Convert to ObjectId
//               timestamp: new Date(),
//             }));
//             room.messages.push(...formattedMessages); // ✅ Batch insert
//             await room.save(); // ✅ Save to DB once
//             unsavedMessages.set(roomId, []); // ✅ Clear cache after saving
//           }
//         }
//       }
//     }, 5000); // ✅ Save every 5 seconds
//     console.log("WebSocket Server running...");
//   };
const ws_1 = require("ws");
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_1 = __importDefault(require("cookie"));
dotenv_1.default.config();
const activeRooms = new Map();
const unsavedMessages = new Map();
const JWT_SECRET = process.env.JWT_SECRET || "SECRET";
// ✅ Authenticate user from JWT token
const authenticateUser = (ws, req) => {
    const cookies = cookie_1.default.parse(req.headers.cookie || '');
    const token = cookies.token;
    console.log(token);
    if (!token) {
        ws.send(JSON.stringify({ type: "dialogue", message: "Please log in to continue" }));
        ws.close();
        return false;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        ws.userId = decoded.userId;
        ws.username = decoded.username;
        ws.send(JSON.stringify({ message: `Welcome ${ws.username}`, type: "dialogue" }));
        return true;
    }
    catch (error) {
        ws.send(JSON.stringify({ type: "dialogue", message: "Invalid token" }));
        ws.close();
        return false;
    }
};
// ✅ Handle room joining logic
const handleRoomJoin = (ws, roomId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!activeRooms.has(roomId)) {
        const room = yield db_1.RoomModel.findOne({ name: roomId });
        if (!room) {
            ws.send(JSON.stringify({ type: "dialogue", message: "Room does not exist" }));
            return false;
        }
        if (!room.members.includes(new mongoose_1.default.Types.ObjectId(ws.userId))) {
            ws.send(JSON.stringify({ type: "dialogue", message: "You are not a member of this room" }));
            return false;
        }
        activeRooms.set(roomId, new Set());
    }
    (_a = activeRooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.add(ws);
    console.log(`User ${ws.username} joined room ${roomId}`);
    return true;
});
// ✅ Broadcast message to other users in room
const broadcastMessage = (roomId, ws, userMessage) => {
    var _a;
    (_a = activeRooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.forEach((client) => {
        if (client !== ws) {
            client.send(JSON.stringify({ type: 'member', username: ws.username, message: userMessage }));
        }
    });
};
// ✅ Handle incoming message
const handleMessage = (ws, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let parsedMsg;
    try {
        parsedMsg = JSON.parse(message);
    }
    catch (e) {
        ws.send(JSON.stringify({ type: "dialogue", message: "Invalid message format" }));
        return;
    }
    const { roomId, message: userMessage } = parsedMsg.payload;
    if (!roomId || !userMessage)
        return;
    const isRoomValid = yield handleRoomJoin(ws, roomId);
    if (!isRoomValid)
        return;
    // ✅ Cache unsaved messages
    if (!unsavedMessages.has(roomId)) {
        unsavedMessages.set(roomId, []);
    }
    (_a = unsavedMessages.get(roomId)) === null || _a === void 0 ? void 0 : _a.push({ message: userMessage, userId: ws.userId || '' });
    // ✅ Broadcast message
    broadcastMessage(roomId, ws, userMessage);
});
// ✅ Handle client disconnection
const handleClose = (ws) => {
    console.log(`User ${ws.username} disconnected`);
    activeRooms.forEach((clients, roomId) => {
        if (clients.has(ws)) {
            clients.delete(ws);
            console.log(`User ${ws.username} removed from room ${roomId}`);
        }
        if (clients.size === 0) {
            activeRooms.delete(roomId);
            console.log(`Room ${roomId} removed from cache`);
        }
    });
};
// ✅ Save messages to DB every 5 seconds
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    for (const [roomId, messages] of unsavedMessages) {
        if (messages.length > 0) {
            const room = yield db_1.RoomModel.findOne({ name: roomId });
            if (room) {
                const formattedMessages = messages.map((msg) => ({
                    message: msg.message,
                    member: new mongoose_1.default.Types.ObjectId(msg.userId),
                    timestamp: new Date(),
                }));
                room.messages.push(...formattedMessages);
                yield room.save();
                unsavedMessages.set(roomId, []);
            }
        }
    }
}), 5000);
// ✅ Setup WebSocket server
const setupWebSocketServer = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on("connection", (ws, req) => {
        if (!authenticateUser(ws, req))
            return;
        ws.on('message', (message) => handleMessage(ws, message.toString()));
        ws.on('close', () => handleClose(ws));
    });
    console.log("webSocket Server running...");
};
exports.setupWebSocketServer = setupWebSocketServer;
