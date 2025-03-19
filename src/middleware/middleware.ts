import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // Extract token from cookiess
       
        const token = req.headers["authorization"] as string;
   


        if (!token) {
            console.log('in not token');

            return res.status(401).json({ message: "Login required" });

        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: string; username: string };
        console.log('token verified');
        // Attach user data to the request object
     
        //@ts-ignore
        req.userId = decoded.userId;
         //@ts-ignore
        req.username = decoded.username;
        console.log('callng next');
        next(); // Proceed to the next middleware or route
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
