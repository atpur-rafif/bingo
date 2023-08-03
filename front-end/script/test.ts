import type { GameEventRequest, GameEventResponse, WebSocketEvent } from "@types"

type GameEventResponseListener = {
    [T in keyof GameEventResponse]: (data: GameEventResponse[T]) => void
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
        this.ws.onmessage = (e) => {
            try {
                const event = JSON.parse(e.data)
                const eventName = event.eventName
                delete event.eventName
                this.emit(eventName, event.data)
            } catch {}
        }
    }

    private listener: {
        [T in keyof GameEventResponse]?: GameEventResponseListener[T][]
    } = {}

    addEventListener<T extends keyof GameEventResponse>(eventName: T, callback: GameEventResponseListener[T]){
        if(!this.listener[eventName]) this.listener[eventName] = []
        this.listener[eventName]?.push(callback)
    }

    removeEventListener<T extends keyof GameEventResponse>(eventName: T, callback: GameEventResponseListener[T]){
        if(!this.listener[eventName]) return
        const index = this.listener[eventName]?.indexOf(callback)
        if(index === undefined) return
        this.listener[eventName]?.splice(index, 1)
    }

    emit<T extends keyof GameEventResponse>(eventName: T, data: GameEventResponse[T]){
        console.log({
            eventName: eventName,
            ...data
        })

        if (!this.listener[eventName]) return
        this.listener[eventName]?.forEach(cb => cb(data))
    }

    async send<T extends keyof GameEventRequest>(eventName: T, data: GameEventRequest[T]){
        await this.wsWait
        this.ws.send(JSON.stringify({
            eventName: eventName,
            data
        } as WebSocketEvent))
    }
}

const g1 = new GameEvent()
const g2 = new GameEvent()

g1.send("create", {
    name: "Helo",
    size: 12,
})

g1.addEventListener("created", (e) => {
    g2.send("join", {
        name: "lmao",
        roomId: e.roomId
    })
})

g1.addEventListener("joined", (e) => {
    g1.send("start", {})
})

g1.addEventListener("started", () => {
    g1.send("ready", {
        PosToVal: {},
        ValToPos: {}
    })

    g2.send("ready", {
        PosToVal: {},
        ValToPos: {}
    })
})
