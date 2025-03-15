// src/firebaseAdmin.ts
import admin from "firebase-admin";
import dotenv from "dotenv"
dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG || "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseAdmin = admin;
