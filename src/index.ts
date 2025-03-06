import { WebSocketServer,WebSocket } from "ws";
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
        const parsedMsg = JSON.parse(message as unknown as string);
        if(parsedMsg.type === 'join')
        {
            allSockets.push({socket, room: parsedMsg.payload.roomId})
            socket.send('successfully joined ' + parsedMsg.payload.roomId)
        }
        if(parsedMsg.type=='chat'){
            let currentUserRoom = allSockets.find((s)=>s.socket==socket)?.room;
            console.log(parsedMsg)
            const userMessage= parsedMsg.payload.message;
            if(!currentUserRoom){
                socket.send('plz join a room first');
            }
            else{
                allSockets.forEach((u)=>{
                   if(u.room == currentUserRoom)
                    u.socket.send(userMessage);
                })

            }
        }
      
    })
    
})