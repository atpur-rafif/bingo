import { GameEventRequest, GameEventResponse, WebSocketEvent } from "@types"
import WebSocket from "ws"
import { Room } from "./room"

type GameEventRequestListener = {
    [T in keyof GameEventRequest]: (data: GameEventRequest[T]) => void
}

export interface WebSocketExtended extends WebSocket{
    debug: boolean
    addCustomEventListener<T extends keyof GameEventRequest>(type: T, cb: GameEventRequestListener[T]): void
    removeCustomEventListener<T extends keyof GameEventRequest>(type: T, cb: GameEventRequestListener[T]): void
    emitCustomEvent<T extends keyof GameEventRequest>(type: T, data: GameEventRequest[T]): void
    sendCustomEvent<T extends keyof GameEventResponse>(type: T, data: GameEventResponse[T], options?:{ room: Room }): void
}

export const extendWebSocket = (ws: WebSocket): WebSocketExtended => {
    const newWs = ws as WebSocketExtended
    const listener:{
        [T in keyof GameEventRequestListener]?: GameEventRequestListener[T][]
    } = {}

    newWs.addCustomEventListener = (eventName, cb) => {
        if(!listener[eventName]) listener[eventName] = []
        listener[eventName]?.push(cb)
    }

    newWs.removeCustomEventListener = (eventName, cb) => {
        if(!listener[eventName]) return
        const index = listener[eventName]?.indexOf(cb)
        if(index === undefined || index === -1) return
        listener[eventName]?.splice(index, 1)
    }

    newWs.emitCustomEvent = (eventName, data) => {
        console.log({
            eventName: eventName,
            ...data
        })

        if(!listener[eventName]) return
        listener[eventName]?.forEach(cb => cb(data))
    }

    newWs.sendCustomEvent = (eventName, data, options) => {
        const res = JSON.stringify({
            eventName: eventName,
            data
        } as WebSocketEvent)

        if(options?.room) options.room.broadcast(res)
        else newWs.send(res)
    }

    return ws as any
}

