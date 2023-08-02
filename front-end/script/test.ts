import type { WS, WSRes } from "@types"

type GameEventListener = {
    [T in WSRes["type"]]: ((data: Omit<Extract<WSRes, { type: T }>, "type">) => any)
}

class GameEvent{
    debug: boolean = false
    private listener: {
        [T in WSRes["type"]]?: GameEventListener[T][]
    } = {}

    addEventListener<T extends keyof GameEventListener>(type: T, callback: GameEventListener[T]){
        if(!this.listener[type]) this.listener[type] = []
        this.listener[type]?.push(callback)
    }

    removeEventListener<T extends keyof GameEventListener>(type: T, callback: GameEventListener[T]){
        if(!this.listener[type]) return
        const index = this.listener[type]?.indexOf(callback)
        if(index === undefined) return
        this.listener[type]?.splice(index, 1)
    }

    emit<T extends keyof GameEventListener>(type: T, param: Parameters<GameEventListener[T]>[0]){
        if(this.debug){
            console.log({
                _type: type,
                ...param
            })
        }

        if(!this.listener[type]) return
        this.listener[type]?.forEach(cb => cb(param))
    }
}

const gameEvent = new GameEvent()
gameEvent.debug = true

const wsLocation = "ws://" + window.location.host

function makeWaiter<T = void>(){
    let resolver 
    const p = new Promise<T>(r => {
        resolver = r
    })

    return [p, resolver] as unknown as [Promise<void>, (value: T) => void]
}

const ws1 = new WebSocket(wsLocation)
ws1.onopen = (e) => {
    ws1.send(JSON.stringify({
        type: "create",
        name: "Hello",
        size: 2
    }))

    ws1.addEventListener("message", (e) => {
        try {
            const data = JSON.parse(e.data)
            const type = data.type
            delete data.type
            gameEvent.emit(type, data)
        } catch (error) {
            console.log(error)
        }
    })
}

const ws2 = new WebSocket(wsLocation)
ws2.onopen = (e) => {
    ws2.addEventListener("message", (e) => {
        try {
            const data = JSON.parse(e.data)
            const type = data.type
            delete data.type
            gameEvent.emit(type, data)
        } catch (error) {
            console.log(error)
        }
    })
}

gameEvent.addEventListener("created", (e) => {
    ws2.addEventListener("open", () => {
        ws2.send(JSON.stringify({
            type: "join",
            name: "lmao",
            roomId: e.roomId
        }))
    })
})
