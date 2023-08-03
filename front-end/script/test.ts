import type { WS, WSReq, WSRes } from "@types"

type GameEventResponse = {
    [T in WSRes["eventName"]]: ((data: Omit<Extract<WSRes, { eventName: T }>, "eventName">) => any)
}

type GameEventRequest = {
    [T in WSReq["eventName"]]: Omit<Extract<WSReq, { eventName: T}>, "eventName">
}

const wsLocation = "ws://" + window.location.host

class GameEvent{
    ws: WebSocket
    wsWait: Promise<void>

    constructor(){
        let resolver: CallableFunction
        this.wsWait = new Promise<void>(r => resolver = r)
        this.ws = new WebSocket(wsLocation)
        this.ws.onopen = () => { resolver() }
    }

    debug: boolean = false
    private listener: {
        [T in WSRes["eventName"]]?: GameEventResponse[T][]
    } = {}

    addEventListener<T extends keyof GameEventResponse>(type: T, callback: GameEventResponse[T]){
        if(!this.listener[type]) this.listener[type] = []
        this.listener[type]?.push(callback)
    }

    removeEventListener<T extends keyof GameEventResponse>(type: T, callback: GameEventResponse[T]){
        if(!this.listener[type]) return
        const index = this.listener[type]?.indexOf(callback)
        if(index === undefined) return
        this.listener[type]?.splice(index, 1)
    }

    emit<T extends keyof GameEventResponse>(type: T, param: Parameters<GameEventResponse[T]>[0]){
        if(this.debug){
            console.log({
                eventName: type,
                ...param
            })
        }

        if(!this.listener[type]) return
        this.listener[type]?.forEach(cb => cb(param))
    }

    async send<T extends keyof GameEventRequest>(type: T, data: GameEventRequest[T]){
        await this.wsWait
        this.ws.send(JSON.stringify({
            eventName: type,
            ...data
        }))
    }
}

const gameEvent1 = new GameEvent()
const gameEvent2 = new GameEvent()

gameEvent1.send("create", {
    name: "Helo",
    roomId: "test",
    size: 12
})

gameEvent1.addEventListener("created", () => {
    gameEvent2.send("join", {
        name: "lmao",
        roomId: "test",
    })
})