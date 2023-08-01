import livereload from "livereload"
import connectLivereload from "connect-livereload"
import path from "path";
import express from "express";
import { WebSocketServer } from "ws";
import { Server } from "http"

const PORT = 8080
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, './static'));

const app = express();
const server = new Server(app)

app.use(connectLivereload());
app.use(express.static("./dist/static"))

const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
    console.log("Connected")

    ws.on("message", (msg) => {
        console.log(msg.toString())
    })

    ws.on("close", ()=>{
        console.log("Disconnected")
    })
})

server.listen(PORT)