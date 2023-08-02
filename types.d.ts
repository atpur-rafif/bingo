type WSCreate = {
    type: "create",
    roomId: string,
    name: string,
    size: number
}

type WSJoin = {
    type: "join",
    roomId: string,
    name: string
}

type WSReady = {
    type: "ready"
    roomId: string
    playerId: string,
    PosToValue: Record<number, number>
    ValueToPos: Record<number, number>
}

type WSTurn = {
    type: "turn"
    pos: number
}

export type WSReq = WSCreate
    | WSJoin
    | WSReady
    | WSTurn


type WSCreated = {
    type: "created"
    roomId: string
    playerId: string
    size: number
}

type WSJoined = {
    type: "joined",
    roomId: string,
    playerId: string
    size: number,
}

type WSTurned = {
    type: "turned",
    pos: number
}

type WSError = {
    type: "error"
    msg: string
}

export type WSRes = WSCreated
    | WSJoined
    | WSTurned
    | WSError

export type WS = [WSReady, void]
    | [WSCreate, WSCreated]
    | [WSJoin, WSJoined]
    | [WSTurn, WSTurned]