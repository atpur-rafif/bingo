class BaseEvent<E extends Record<string, any>>{
    private listener: Partial<Record<keyof E, CallableFunction[]>> = {}

    addEventListener<K extends keyof E>(eventName: K, cb: (data: E[K]) => void){
        if(!this.listener[eventName]) this.listener[eventName] = []
        this.listener[eventName]?.push(cb)
    }

    removeEventListener<K extends keyof E>(eventName: K, cb: (data: E[K]) => void){
        if(!this.listener[eventName]) this.listener[eventName] = []
        const index = this.listener[eventName]?.indexOf(cb)
        if(index === undefined || index === -1) return
        this.listener[eventName]?.splice(index, 1)
    }

    emitEvent<K extends keyof E>(eventName: K, data: E[K]){
        if(!this.listener[eventName]) return
        this.listener[eventName]?.forEach(cb => cb(data))
    }
}

type GameEventName = {
    "join": null,
    "create": null
}

export class GameEvent extends BaseEvent<GameEventName>{}

const p = new GameEvent()
p.addEventListener("join", () => {
    console.log("someone joined")
})

p.emitEvent("join", null)