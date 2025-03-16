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
// const corsOptions={
//   origin: ["https://chatapp-adv-fe-production.up.railway.app","http://localhost:5173","http://localhost:5175",], // Your frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true, // ✅ Allow cookies
//   allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Methods", "Access-Control-Request-Headers"],
//   enablePreflight:true,
  
// }
app.use(
  cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);




app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRouter);
app.use('/api/rooms',roomRouter);
const server = http.createServer(app);
setupWebSocketServer(server);
//@ts-ignore

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });