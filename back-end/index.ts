import livereload from "livereload"
import connectLivereload from "connect-livereload"
import path from "path";
import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http"
import { Room } from "./room"

const PORT = 8080
const app = express();
const server = new Server(app);

const liveReloadServer = livereload.createServer({}, () => {
    const fnOut = (socket: WebSocket) => {
        const fnIn = ({ data }: any) => {
            if(JSON.parse(data).command === "hello"){
                liveReloadServer.refresh(".")
                socket.removeEventListener("message", fnIn)
            }
        }
       socket.addEventListener("message", fnIn)
       liveReloadServer.server.removeListener("connection", fnOut)
    }
    liveReloadServer.server.addListener("connection", fnOut)
});
liveReloadServer.watch(path.join(__dirname, './static'));

app.use(connectLivereload());
app.use(express.static(path.join(__dirname, './static')))

const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req) => {
    console.log("Connected")

    ws.on("message", (msg) => {
        try {
            console.log(JSON.parse(msg.toString()))
        } catch (error) {
            console.log("-")
        }
    })

    ws.on("close", ()=>{
        console.log("Disconnected")
    })
})


server.listen(PORT)