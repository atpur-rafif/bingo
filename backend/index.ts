import livereload from "livereload";
import connectLivereload from "connect-livereload";
import path from "path";
import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { Room } from "./room";
import { Player } from "./player";
import { GameEventRequest, GameEventResponse, WebSocketEvent } from "@types";
import { extendWebSocket } from "./ws-extend";

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
    room: Room
    player: Player
}

wss.addListener("connection", (rawClient) => {
    console.log("\n")
    const client = extendWebSocket(rawClient)
    const state: ConnectionState = {} as any

    client.addEventListener("message", (e) => {
        try {
            const event = JSON.parse(e.data.toString())
            client.emitCustomEvent(event.eventName, event.data)
        } catch (error) {
            client.sendCustomEvent("error", {
                msg: (error as any).toString()
            })
        }
    })

    client.addCustomEventListener("create", (d) => {
        const p = new Player({
            name: d.name,
            webSocket: client
        })

        const r = new Room({
            size: d.size,
            gameMaster: p
        })

        ROOM[r.id] = r
        state.player = p
        state.room = r

        client.sendCustomEvent("created", {
            roomId: r.id,
            playerId: p.id
        })
    })

    client.addCustomEventListener("join", (d) => {
        const r = ROOM[d.roomId]
        if(!r) throw "Invalid room"

        const p = new Player({
            name: d.name,
            webSocket: client
        })

        r.addPlayer(p)
        state.player = p
        state.room = r

        client.sendCustomEvent("joined", {
            names: r.getPlayers().map(p => p.name)
        }, { room: r })
    })

    client.addCustomEventListener("start", () => {
        if(state.player.id !== state.room.gameMasterId) throw "You're not game master"
        client.sendCustomEvent("started", {}, { room : state.room })
    })

    client.addCustomEventListener("ready", (d) => {
        state.player.setReady({
            PosToVal: d.PosToVal,
            ValToPos: d.ValToPos
        })

        if(state.room.allReady()){
            client.sendCustomEvent("readied", {}, { room: state.room })
        }
    })

    client.addEventListener("close", () => {
        const room = state.room
        const player = state.player
        if(!room || !player) return

        room.removePlayer(player)
        if(player.id === room.gameMasterId){
            delete ROOM[room.id]
        }
    })
})

server.listen(PORT)