import { WebSocket } from "ws";

const uid = function(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

type GameConfig = {
    size: number
}

export class Room{
    id: string
    size: number
    players: Record<string, Player> = {}
    gameMaster: Player | undefined

    constructor(config: GameConfig){
        this.id = `room-${uid()}`
        this.size = config.size
    }

    addPlayer(player: Player, asGameMaster: boolean = false){
        this.players[player.id] = player
        if(asGameMaster) this.gameMaster = player
    }

    removePlayer(player: Player){
        delete this.players[player.id]
    }

    getPlayer(id: string){
        return this.players[id]
    }

    forEachPlayer(fn: (p: Player) => void){
        Object.values(this.players).forEach(p => fn(p))
    }

    broadcast(data: string){
        this.forEachPlayer(p => p.ws.send(data))
    }

    allReady(){
        let ready = true
        this.forEachPlayer(p => {
            if(!p.ready) ready = false
        })
        return ready
    }
}

const game = new Room({
    size: 5
})

type PlayerBoard = {
    PosToVal: Record<number, number>
    ValToPos: Record<number, number>
}

type PlayerConfig = {
    name: string
    webSocket: WebSocket
}

export class Player{
    id: string
    ready: boolean
    ws: WebSocket
    PosToVal: PlayerBoard['PosToVal'] | undefined
    ValToPos: PlayerBoard['ValToPos'] | undefined
    checked: Set<number> = new Set()

    constructor(config: PlayerConfig){
        this.id = `player-${uid()}`
        this.ready = false
        this.ws = config.webSocket
    }

    setReady(board: PlayerBoard){
        this.PosToVal = board.PosToVal
        this.ValToPos = board.ValToPos
        this.ready = true
    }
}