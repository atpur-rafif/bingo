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
    PosToVal: Record<number, number>
    ValToPos: Record<number, number>
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

type WSReadied = {
    type: "readied",
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
    | WSReadied
    | WSTurned
    | WSError

export type WS = [WSReady, WSReadied | void]
    | [WSCreate, WSCreated]
    | [WSJoin, WSJoined]
    | [WSTurn, WSTurned]