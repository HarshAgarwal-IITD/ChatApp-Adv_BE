import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { firebaseAdmin } from "../firebaseAdmin";
import { authMiddleware } from "../middleware/middleware";
import { z } from "zod";
import { UserModel } from "../db";
import {Request ,Response , NextFunction} from 'express'
import dotenv from 'dotenv'
dotenv.config();
const JWT_SECRET= process.env.JWT_SECRET;

const authRouter = express.Router();

// Zod Schema
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
//@ts-ignore
authRouter.post("/signup", async (req, res) => {
  console.log('insignup')
    try {
      const { username, email, password } = signupSchema.parse(req.body);
      console.log(req.body)
  
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ username, email, password: hashedPassword });
  
  
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
//@ts-ignore
  authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    const user = await UserModel.findOne({ email });
    console.log(user)
    
   if(!user){
    return res.status(400).json({
        message:'user does not exist'
    })
   }
    //@ts-ignore
   const correct =await bcrypt.compare(password,user?.password)
  
  console.log(correct)
   if (!correct){
    return res.status(400).json({
        message:'incorrect password'
    })
    ;
   }
   if(user)
   {
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET ||"SECRET", { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: false, sameSite: "lax", secure: false  , path: '/'});
  
   return res.json({ message: "Login successful", token ,username:user.username});
   } 
  });
  //@ts-ignore
  authRouter.post("/logout",authMiddleware, (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out" });
  });
  // ✅ Route to handle Google Sign-in



  //@ts-ignore
authRouter.post("/google-signin", async (req, res) => {
  const { token } = req.body;
  console.log(req.body)

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // 🔑 Verify Firebase token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const { email, name, uid } = decodedToken;
   

    console.log("Decoded Token:", decodedToken);

    // ✅ Find or create user in the database
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({
        username: name,
        email,
        password: uid, // You can leave password blank or store UID as password
      });
    }

    // ✅ Generate JWT token for session
    const jwtToken = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET || "SECRET",
      { expiresIn: "1h" }
    );

    // ✅ Set cookie for authentication
    res.cookie("token", jwtToken, {
      httpOnly: false,
      secure: false, // Set to true for HTTPS
      sameSite: "lax",
      
    });

    return res.status(200).json({ message: "Google Sign-in successful", token: jwtToken });
  } catch (error) {
    console.error("Google Sign-in error:", error);
    return res.status(401).json({ message: "Invalid Google token" });
  }
});

  export default authRouter;