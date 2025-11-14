const express =require("express")
const socket= require("socket.io")
const http=require("http")
const {Chess}=require("chess.js")
const path=require("path")
const { log } = require("console")
const app=express()
const server =http.createServer(app)

const io=socket(server)

const chess = new Chess()

let players={}
let currentPlayer='W'


app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))


app.get('/',(req,res)=>{
    res.render('index',{title:"Chess Game"})

})

io.on('connection',(Uniqsocket)=>{
    console.log("New user connected: "+Uniqsocket.id)})

    if(!players.white){
        players.white=Uniqsocket.id
        Uniqsocket.emit('playerColor','W')
    }
    else if(!players.black){
        players.black=Uniqsocket.id
        Uniqsocket.emit('playerColor','B')
    }
    else{
        Uniqsocket.emit('playerColor','Spectator')  
    }
   
    Uniqsocket.on("disconnect",()=>{
        console.log("User disconnected: "+Uniqsocket.id)
        if(players.white===Uniqsocket.id){
            delete players.white
        }
        else if(players.black===Uniqsocket.id){
            delete players.black
        }
    })

    Uniqsocket.on("move",(move)=>{
        try{
            if(chess.turn()=='W' && Uniqsocket.id!=players.white)return
            if(chess.turn()=='B' && Uniqsocket.id!=players.black)return

            const result=chess.move(move)
            if(result)
            {
                currentPlayer=chess.turn()
                io.emit("move",move)
                io.emit("boardState",chess.fen())
            }else{
                console.log("Invalid Move :",move)
                Uniqsocket.emit("invalidMove",move)
                
            }
        }
        catch(err){}
    })
    
 
 
   

server.listen(3000,()=>{
    console.log("Server is running on  http://localhost:3000")
})