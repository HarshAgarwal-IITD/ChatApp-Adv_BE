"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware/middleware");
const roomControllers_1 = require("../controllers/roomControllers");
const roomRouter = express_1.default.Router();
//@ts-ignore
roomRouter.post("/create", middleware_1.authMiddleware, roomControllers_1.createRoom);
//@ts-ignore
roomRouter.post("/:roomName/join", middleware_1.authMiddleware, roomControllers_1.joinRoom);
//@ts-ignore
roomRouter.delete("/:roomName/exit", middleware_1.authMiddleware, roomControllers_1.exitRoom);
//@ts-ignore
roomRouter.get('/:roomName/messages', middleware_1.authMiddleware, roomControllers_1.getMessages);
exports.default = roomRouter;
