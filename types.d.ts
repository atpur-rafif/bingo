// Fix this thing
type WSCreate = {
    eventName: "create",
    roomId: string,
    name: string,
    size: number
}

type WSJoin = {
    eventName: "join",
    roomId: string,
    name: string
}

type WSReady = {
    eventName: "ready"
    roomId: string
    playerId: string,
    PosToVal: Record<number, number>
    ValToPos: Record<number, number>
}

type WSTurn = {
    eventName: "turn"
    pos: number
}

export type WSReq = WSCreate
    | WSJoin
    | WSReady
    | WSTurn

type WSCreated = {
    eventName: "created"
    roomId: string
    playerId: string
    size: number
}

type WSJoined = {
    eventName: "joined",
    roomId: string,
    playerId: string
    size: number,
}

type WSReadied = {
    eventName: "readied",
}

type WSTurned = {
    eventName: "turned",
    pos: number
}

type WSError = {
    eventName: "error"
    msg: string
}

export type WSRes = WSCreated
    | WSJoined
    | WSReadied
    | WSTurned
    | WSError

export type WS = [WSReady, WSReadied | void]
    | [WSCreate, WSCreated]
    | [WSJoin, WSJoined]
    | [WSTurn, WSTurned]