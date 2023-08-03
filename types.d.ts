export type GameEventRequest = {
    create: {
        name: string
        size: number
    },
    join: {
        name: string
        roomId: string
    },
    start: {},
    ready: {
        PosToVal: Record<number, number>
        ValToPos: Record<number, number>
    },
    turn: {
        pos: number
    },
    finish: {},

    // TODO: Implement refresh later
}

export type GameEventResponse = {
    created: {
        roomId: string,
        playerId: string
    },
    joined: {
        names: string[]
    },
    started: {},
    readied: {},
    turned: {
        pos: number
    },
    finished: {},
    error: {
        msg: string
    }
}

export type GameEvent = GameEventRequest & GameEventResponse
export type WebSocketEvent = {
    [T in keyof GameEvent]: {
        eventName: T,
        data: GameEvent[T]
    }
}[keyof GameEvent]