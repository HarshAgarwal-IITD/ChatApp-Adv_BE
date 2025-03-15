import express from "express";
import  { Request, Response } from "express";
import { authMiddleware } from "../middleware/middleware"
import { RoomModel } from "../db";

import {  joinRoom, exitRoom, createRoom, getMessages } from "../controllers/roomControllers";
import { auth } from "firebase-admin";


const roomRouter = express.Router();
//@ts-ignore
roomRouter.post("/create", authMiddleware,createRoom);
//@ts-ignore
roomRouter.post("/:roomName/join",authMiddleware, joinRoom);
//@ts-ignore
roomRouter.delete("/:roomName/exit", authMiddleware,exitRoom);
//@ts-ignore
roomRouter.get('/:roomName/messages',authMiddleware,getMessages)

export default roomRouter;
