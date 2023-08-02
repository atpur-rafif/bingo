import type { WS, WSRes } from "@types"

const wsLocation = "ws://" + window.location.host

const onReply: {
    [T in WSRes["type"]]: () => void
} = {

} as any

function makeWaiter<T>(){
    let resolver 
    const p = new Promise<T>(r => {
        resolver = r
    })

    return [p, resolver] as unknown as [Promise<void>, (value: T) => void]
}

const [waitCreate, waitCreateResolver] = makeWaiter<string>()

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
            if(data.type === "created"){
                waitCreateResolver(data.roomId)
            }
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    })
}

const ws2 = new WebSocket(wsLocation)
ws2.onopen = (e) => {
    waitCreate.then((roomId) => {
        ws2.send(JSON.stringify({
            type: "join",
            name: "lmao",
            roomId
        }))
    })
}