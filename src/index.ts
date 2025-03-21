import express from 'express'
import http from 'http'
import authRouter from './routes/authRoutes'
import roomRouter from './routes/roomRoutes'
import { setupWebSocketServer } from './websocket/chatSocket'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();    

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL ||'SECRET';

console.log("Server running on port:", process.env.PORT);
mongoose.connect(MONGO_URL)



const app = express();



app.use(cors());




app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRouter);
app.use('/api/rooms',roomRouter);
const server = http.createServer(app);
setupWebSocketServer(server);
//@ts-ignore

server.listen(PORT, () => {
    console.log(`🚀 Server running on https://chatapp-advbe-production-b8a5.up.railway.app/:${PORT}`);
  });