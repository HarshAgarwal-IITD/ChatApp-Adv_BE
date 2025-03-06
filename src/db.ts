import mongoose, { model,Schema } from "mongoose";
import { MONGO_URL } from "./config";
// Replace the uri string with your connection string.
mongoose.connect(MONGO_URL);
 const RoomSchema = new Schema({
    messages: [{message:String,user:{type:mongoose.Types.ObjectId , ref:"User"}}],
    users: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
 })

 const UserSchema = new Schema({
    username:String,
    password:String,
    email:{String , unique:true},
   

 })
export const UserModel =  model("User",UserSchema);
export const RoomModel =  model("Room",RoomSchema);