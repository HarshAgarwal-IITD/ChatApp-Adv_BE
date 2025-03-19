import { Request, Response } from "express";
import {RoomModel} from "../db";


// **Create Room**
export async function  createRoom  (req: Request, res: Response){
  console.log('in create room')
  try {
    const { roomName } = req.body;
    //@ts-ignore
    const userId= req.userId;
    
    const room =await  RoomModel.create({ name: roomName, members: [userId], messages: [] })
    console.log(room);
    // res.cookie("roomId", room._id, { httpOnly: true, sameSite: "strict", secure: false });
   
    return res.status(201).json({ message: "Room created successfully", room , });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

// **Join Room**
export async function joinRoom(req: Request, res: Response)  {
  const { roomName } = req.params;
  //@ts-ignore
  const userId  = req.userId;
  console.log('user id is ',userId)

  try {
    const room = await RoomModel.findOne({name:roomName});

    if (!room) 
        return res.status(404).json({ message: "Room not found" });
    
    // const includes =room.members.includes(userId);
    const includes = room.members.some((member) => member.toString() === userId);
  
    console.log('includes is ',includes)
    if (!includes) {

      room.members.push(userId);
      console.log(room)
      await room.save();
    }
    else if (includes){
      return res.json({message:'already in the room'})
    }

    return res.json({ message: "Joined room", room });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

// **Exit Room**
export async function  exitRoom  (req: Request, res: Response) {
  const { roomName } = req.params;
  //@ts-ignore
  const userId = req.userId;
  
  try {
    const room = await RoomModel.findOne({name:roomName});
    console.log(room)
   
    if (!room) return res.status(404).json({ message: "Room not found" });
    
    // const includes =room.members.includes(userId);
    const includes = room.members.some((member) => member.toString() === userId);
    if(!includes){
      return res.json({message:"not in the room"})
    }
    room.members = room.members.filter((member) => member.toString() !== userId);
    console.log('roommebers after filter', room.members)
    await room.save();

    // If no members are left, delete the room
    //@ts-ignore
    if (room.members.length === 0) {
      await RoomModel.findByIdAndDelete(room._id);
      return res.json({ message: "Room deleted as no members are left" });
    }

    return res.json({ message: "User removed from room", room });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};


export async function getMessages(req: Request, res: Response){
  //@ts-ignore
  const userId = req.userId;

  const { roomName } = req.params;
  try{
    const room = await RoomModel.findOne({ name: roomName })
    .populate('messages.member', 'username'); // Populate member details
    console.log(room);

   
    if (!room) return res.status(404).json({ message: "Room not found" });

    const includes = room.members.some((member) => member.toString() === userId);
    if(!includes){
      return res.status(403).json({message:"not in the room"})
    }
   
    return res.status(200).json({
      messages: room.messages.map((msg) => ({
        message: msg.message,
        //@ts-ignore
        type:msg.member._id.toString()===userId ?"self":"member",
        //@ts-ignore
        
      })),
    });
  }
  catch(e){
    res.status(500).json({
      error:e
    });
    }
  

}
