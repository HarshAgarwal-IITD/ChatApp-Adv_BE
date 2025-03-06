import { WebSocketServer,WebSocket } from "ws";
import { UserModel,RoomModel } from "./db";
const wss = new WebSocketServer({port:8080});

let count =0;
interface User{
    socket:WebSocket,
    room:string
}
let allSockets:User[] = [];
wss.on('connection',(socket)=>{
    
    
    count++;
    console.log('userConnected',count)
    socket.on('message',(message)=>{
        let messageToSend={
            type:'',message:""
        }
        const parsedMsg = JSON.parse(message as unknown as string);
        if(parsedMsg.type=='exit'){
            allSockets.filter(s=>s.socket!=socket)
            messageToSend.type="dialogue";
            messageToSend.message="successfully exited the room";
            socket.send(JSON.stringify(messageToSend));
            
        }
        if(parsedMsg.type === 'join')
        {
            allSockets.push({socket, room: parsedMsg.payload.roomId})
            messageToSend.type="dialogue";
            messageToSend.message="successfully joined roomId: "+ parsedMsg.payload.roomId;
            socket.send(JSON.stringify(messageToSend));
            console.log(messageToSend)
           
        }
        if(parsedMsg.type=='chat'){
            let currentUserRoom = allSockets.find((s)=>s.socket==socket)?.room;
            console.log(parsedMsg)
            const userMessage= parsedMsg.payload.message;
            if(!currentUserRoom){
                messageToSend.type="dialogue";
                messageToSend.message="join a room first to send messages";
                socket.send(JSON.stringify(messageToSend));
               
            }
            else{
                allSockets.forEach((u)=>{
                   if(u.room == currentUserRoom && u.socket!==socket){
                    messageToSend.type="member";
                    messageToSend.message=userMessage;
                    u.socket.send(JSON.stringify(messageToSend));
                   }
                   
                })

            }
        }
       
      
        })
  
    
})