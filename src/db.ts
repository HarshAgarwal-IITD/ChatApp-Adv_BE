import mongoose, { model,Schema } from "mongoose";

// Replace the uri string with your connection string.

 const RoomSchema = new Schema({
    messages: [{message:String,
      member:{type:mongoose.Types.ObjectId , ref:"User"},
      timestamp: { type: Date, default: Date.now }
      }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    name:{type:String,required:true,unique:true} 
 })

 const UserSchema = new Schema({
    username:{type:String  ,required:true},
    password:{type:String ,required:true},
    email:{type:String , unique:true ,required:true},
   

 })
export const UserModel =  model("User",UserSchema);
export const RoomModel =  model("Room",RoomSchema);