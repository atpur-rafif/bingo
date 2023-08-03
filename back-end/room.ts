import { Player } from "./player";
import { uid } from "./util";

type RoomConfig = {
    gameMaster: Player
    size: number
}

export class Room{
    id: string
    size: number
    players: Record<string, Player> = {}
    gameMasterId: string

    constructor(config: RoomConfig){
        this.id = `room-${uid()}`
        this.size = config.size
        this.gameMasterId = config.gameMaster.id
        this.addPlayer(config.gameMaster)
    }

    addPlayer(player: Player){
        this.players[player.id] = player
    }

    removePlayer(player: Player){
        delete this.players[player.id]
    }

    getPlayer(id: string){
        return this.players[id]
    }

    getPlayers(){
        return Object.values(this.players)
    }

    broadcast(data: string){
        this.getPlayers().forEach(p => p.ws.send(data))
    }

    allReady(){
        let ready = true
        this.getPlayers().forEach(p => {
            if(!p.ready) ready = false
        })
        return ready
    }
}