// Description: Websocket server for chat application.

import { WebSocketServer, WebSocket } from "ws";
import { RoomModel } from "../db";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import mongoose from "mongoose";



dotenv.config();

interface AuthenticatedClient extends WebSocket {
  userId?: string;
  username?: string;
}

interface UserMessageFormat {
  type: string;
  payload: {
    roomId: string;
    message: string;
  };
}

const activeRooms = new Map<string, Set<WebSocket>>();
const unsavedMessages = new Map<string, { message: string; userId: string }[]>();
const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

// ✅ Authenticate user from JWT token
const authenticateUser = (ws: AuthenticatedClient, req: any): boolean => {
  
  const token = req.headers['sec-websocket-protocol'];
  console.log(token)
  if (!token) {
    console.log('no token')
    ws.send(JSON.stringify({ type: "dialogue", message: "Please log in to continue" }));
    ws.close();
    return false;
  }

  try {
    console.log('token present')
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    console.log('token verifyed')
    ws.userId = decoded.userId;
    ws.username = decoded.username;
    ws.send(JSON.stringify({ message: `Welcome ${ws.username}`,type: "dialogue" }));
    return true;
  } catch (error) {
    ws.send(JSON.stringify({ type: "dialogue", message: "Invalid token" }));
    ws.close();
    return false;
  }
};

// ✅ Handle room joining logic
const handleRoomJoin = async (ws: AuthenticatedClient, roomId: string) => {
  if (!activeRooms.has(roomId)) {
    const room = await RoomModel.findOne({ name: roomId });
    if (!room) {
      ws.send(JSON.stringify({ type: "dialogue", message: "Room does not exist" }));
      return false;
    }

    if (!room.members.includes(new mongoose.Types.ObjectId(ws.userId))) {
      ws.send(JSON.stringify({ type: "dialogue", message: "You are not a member of this room" }));
      return false;
    }

    activeRooms.set(roomId, new Set());
  }

  activeRooms.get(roomId)?.add(ws);
  console.log(`User ${ws.username} joined room ${roomId}`);
  return true;
};

// ✅ Broadcast message to other users in room
const broadcastMessage = (roomId: string, ws: AuthenticatedClient, userMessage: string) => {
  activeRooms.get(roomId)?.forEach((client) => {
    if (client !== ws) {
      client.send(
        JSON.stringify({ type: 'member', username: ws.username, message: userMessage })
      );
    }
  });
};

// ✅ Handle incoming message
const handleMessage = async (ws: AuthenticatedClient, message: string) => {
  let parsedMsg: UserMessageFormat;
  
  try {
    parsedMsg = JSON.parse(message);
  } catch (e) {
    ws.send(JSON.stringify({ type: "dialogue", message: "Invalid message format" }));
    return;
  }

  const { roomId, message: userMessage } = parsedMsg.payload;

  if (!roomId || !userMessage) return;

  const isRoomValid = await handleRoomJoin(ws, roomId);
  if (!isRoomValid) return;

  // ✅ Cache unsaved messages
  if (!unsavedMessages.has(roomId)) {
    unsavedMessages.set(roomId, []);
  }
  unsavedMessages.get(roomId)?.push({ message: userMessage, userId: ws.userId || '' });

  // ✅ Broadcast message
  broadcastMessage(roomId, ws, userMessage);
};

// ✅ Handle client disconnection
const handleClose = (ws: AuthenticatedClient) => {
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
setInterval(async () => {
  for (const [roomId, messages] of unsavedMessages) {
    if (messages.length > 0) {
      const room = await RoomModel.findOne({ name: roomId });
      if (room) {
        const formattedMessages = messages.map((msg) => ({
          message: msg.message,
          member: new mongoose.Types.ObjectId(msg.userId),
          timestamp: new Date(),
        }));
        room.messages.push(...formattedMessages);
        await room.save();
        unsavedMessages.set(roomId, []);
      }
    }
  }
}, 5000);

// ✅ Setup WebSocket server
export const setupWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: AuthenticatedClient, req) => {
    if (!authenticateUser(ws, req)) return;

    ws.on('message', (message) => handleMessage(ws, message.toString()));
    ws.on('close', () => handleClose(ws));
  });

  console.log("webSocket Server running...");
};


