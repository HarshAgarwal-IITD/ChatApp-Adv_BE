"use strict";
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
exports.authMiddleware = authMiddleware;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "SECRET";
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Extract token from cookiess
            const token = req.headers["authorization"];
            if (!token) {
                console.log('in not token');
                return res.status(401).json({ message: "Login required" });
            }
            // Verify the token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            console.log('token verified');
            // Attach user data to the request object
            //@ts-ignore
            req.userId = decoded.userId;
            //@ts-ignore
            req.username = decoded.username;
            console.log('callng next');
            next(); // Proceed to the next middleware or route
        }
        catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    });
}
