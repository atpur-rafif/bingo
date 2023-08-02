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

const handler: {
    [T in WSReq["type"]]: Extract<WS, [{ type: T }, any]> extends [infer A, infer B] ? (
        data: A,
        state: ConnectionState,
        webSocket: WebSocket
    ) => B | WSError : never
} = {
    create(data, state, webSocket){
        if(typeof data.name !== "string") throw `Invalid name`
        if(data.name.length < 5) throw `Invalid name length, minimal 5`
        if(typeof data.size !== "number") throw `Invalid size`

        const p = new Player({
            name: data.name,
            webSocket
        })

        const r = new Room({
            size: data.size
        })

        r.addPlayer(p, true)
        ROOM[r.id] = r
        state.room = r
        state.player = p

        return {
            type: "created",
            roomId: r.id,
            playerId: p.id,
            size: r.size,
        }
    },
    join(data, state, webSocket){
        const r = ROOM[data.roomId]
        if(typeof data.roomId !== "string") throw `Invalid id`
        if (!r) throw "Room not found"

        const p = new Player({
            name: data.name,
            webSocket
        })

        r.addPlayer(p)

        state.room = r
        state.player = p

        return {
            type: "joined",
            roomId: r.id,
            playerId: p.id,
            size: r.size
        }
    },
    ready(data, state){
        const r = ROOM[data.roomId]
        const p = r.getPlayer(data.playerId)
        if(!r || !p) throw "Invalid room or player"

        p.setReady({
            PosToVal: data.PosToVal,
            ValToPos: data.ValToPos
        })

        if(r.allReady()){
            return {
                type: "readied"
            }
        }
    },
    turn(data, state){
        return {
            type: "turned",
            pos: 0
        }
    },
}

wss.addListener("connection", (client) => {
    const state: ConnectionState = {}

    client.addEventListener("message", (e) => {
        try {
            const data: WSReq = JSON.parse(e.data.toString())
            const fn = handler[data.type]
            if(!fn) throw Error(`type "${data.type}" is invalid`)
            const res = handler[data.type](data as any, state, client)

            const r = state.room
            if(!r) throw "Invalid room"
            r.broadcast(JSON.stringify(res))
        } catch (error) {
            client.send(JSON.stringify({
                type: "error",
                msg: (error as any).toString()
            } as WSError))
        }
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