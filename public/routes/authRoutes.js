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
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebaseAdmin_1 = require("../firebaseAdmin");
const middleware_1 = require("../middleware/middleware");
const zod_1 = require("zod");
const db_1 = require("../db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const authRouter = express_1.default.Router();
// Zod Schema
const signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
//@ts-ignore
authRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('insignup');
    try {
        const { username, email, password } = signupSchema.parse(req.body);
        console.log(req.body);
        const existingUser = yield db_1.UserModel.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already exists" });
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield db_1.UserModel.create({ username, email, password: hashedPassword });
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Server error" });
    }
}));
//@ts-ignore
authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log(req.body);
    const user = yield db_1.UserModel.findOne({ email });
    console.log(user);
    if (!user) {
        return res.status(400).json({
            message: 'user does not exist'
        });
    }
    //@ts-ignore
    const correct = yield bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
    console.log(correct);
    if (!correct) {
        return res.status(400).json({
            message: 'incorrect password'
        });
    }
    if (user) {
        const token = jsonwebtoken_1.default.sign({ userId: user._id, username: user.username }, JWT_SECRET || "SECRET", { expiresIn: "1h" });
        // res.cookie("token", token, { httpOnly: false, sameSite: "lax", secure: false  , path: '/'});
        return res.json({ message: "Login successful", token, username: user.username });
    }
}));
//@ts-ignore
authRouter.post("/logout", middleware_1.authMiddleware, (req, res) => {
    // res.clearCookie("token");
    return res.json({ message: "Logged out" });
});
// ✅ Route to handle Google Sign-in
//@ts-ignore
authRouter.post("/google-signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    console.log(req.body);
    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }
    try {
        // 🔑 Verify Firebase token
        const decodedToken = yield firebaseAdmin_1.firebaseAdmin.auth().verifyIdToken(token);
        const { email, name, uid } = decodedToken;
        console.log("Decoded Token:", decodedToken);
        // ✅ Find or create user in the database
        let user = yield db_1.UserModel.findOne({ email });
        if (!user) {
            user = yield db_1.UserModel.create({
                username: name,
                email,
                password: uid, // You can leave password blank or store UID as password
            });
        }
        console.log(user);
        // ✅ Generate JWT token for session
        const jwtToken = jsonwebtoken_1.default.sign({ userId: user._id, username: user.username }, JWT_SECRET || "SECRET", { expiresIn: "1h" });
        console.log(jwtToken);
        // ✅ Set cookie for authentication
        // res.cookie("token", jwtToken, {
        //   httpOnly: false,
        //   secure: false, // Set to true for HTTPS
        //   sameSite: "lax",
        // });
        return res.status(200).json({ message: "Google Sign-in successful", token: jwtToken });
    }
    catch (error) {
        console.error("Google Sign-in error:", error);
        return res.status(401).json({ message: "Invalid Google token" });
    }
}));
exports.default = authRouter;
