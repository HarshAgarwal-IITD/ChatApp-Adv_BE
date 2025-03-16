"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const chatSocket_1 = require("./websocket/chatSocket");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'SECRET';
console.log("Server running on port:", process.env.PORT);
mongoose_1.default.connect(MONGO_URL);
const app = (0, express_1.default)();
// const corsOptions={
//   origin: ["https://chatapp-adv-fe-production.up.railway.app","http://localhost:5173","http://localhost:5175",], // Your frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true, // ✅ Allow cookies
//   allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Methods", "Access-Control-Request-Headers"],
//   enablePreflight:true,
// }
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
const server = http_1.default.createServer(app);
(0, chatSocket_1.setupWebSocketServer)(server);
//@ts-ignore
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
