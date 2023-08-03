import livereload from "livereload";
import connectLivereload from "connect-livereload";
import path from "path";
import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { Room, Player } from "./room";
import { WSReq, WS, WSError } from "@types";

const debugValue = true
function debug(msg: any){ if(debugValue) console.log(msg) }

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

app.get("/debug", (_, res) => {
    console.log(ROOM)
    res.send(JSON.stringify(ROOM))
})

const wss = new WebSocketServer({ server })

// TODO: Make getRoom function
const ROOM: Record<string, Room> = {}

type ConnectionState = {
    room?: Room
    player?: Player
}

type WebSocketExtendedListener = {
    [T in WSReq["eventName"]]: (data: Omit<Extract<WSReq, { type: T }>, "type">) => void
}

interface WebSocketExtended extends WebSocket{
    debug: boolean
    addCustomEventListener<T extends keyof WebSocketExtendedListener>(type: T, cb: WebSocketExtendedListener[T]): void
    removeCustomEventListener<T extends keyof WebSocketExtendedListener>(type: T, cb: WebSocketExtendedListener[T]): void
    emitCustomEvent<T extends keyof WebSocketExtendedListener>(type: T, data: Parameters<WebSocketExtendedListener[T]>[0]): void
}

const extendWebSocket = (ws: WebSocket): WebSocketExtended => {
    const newWs = ws as WebSocketExtended
    const listener:{
        [T in keyof WebSocketExtendedListener]?: WebSocketExtendedListener[T][]
    } = {}

    newWs.debug = true
    newWs.addCustomEventListener = (type, cb) => {
        if(!listener[type]) listener[type] = []
        listener[type]?.push(cb)
    }

    newWs.removeCustomEventListener = (type, cb) => {
        if(!listener[type]) return
        const index = listener[type]?.indexOf(cb)
        if(index === undefined) return
        listener[type]?.splice(index, 1)
    }

    newWs.emitCustomEvent = (type, data) => {
        if(!listener[type]) return
        listener[type]?.forEach(cb => cb(data))
    }

    return ws as any
}

wss.addListener("connection", (rawClient) => {
    const client = extendWebSocket(rawClient)
    const state: ConnectionState = {}

    client.addEventListener("message", (e) => {
        try {
            const data: WSReq = JSON.parse(e.data.toString())
            client.emitCustomEvent(data.eventName, data as any)
        } catch (error) {
            client.send(JSON.stringify({
                eventName: "error",
                msg: (error as any).toString()
            } as WSError))
        }
    })

    client.addCustomEventListener("create", (d) => {
        console.log(d)
    })
    
    client.addCustomEventListener("join", (d) => {
        console.log("Joined")
    })

    client.addEventListener("close", () => {
        const room = state.room
        const player = state.player
        if(!room || !player) return

        delete state.player
        room.removePlayer(player)
        if(room.gameMaster === player){
            delete state.room
            delete ROOM[room.id]
        }
    })
})

server.listen(PORT)