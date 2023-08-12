import { WebSocketExtended } from "./ws-extend";
import { uid } from "./util";

type PlayerBoard = {
    PosToVal: Record<number, number>;
    ValToPos: Record<number, number>;
};
type PlayerConfig = {
    name: string;
    webSocket: WebSocketExtended;
};

export class Player {
    id: string;
    name: string;
    ready: boolean;
    ws: WebSocketExtended;
    PosToVal: PlayerBoard['PosToVal'] | undefined;
    ValToPos: PlayerBoard['ValToPos'] | undefined;
    checked: Set<number> = new Set();

    constructor(config: PlayerConfig) {
        this.id = `player-${uid()}`;
        this.ready = false;
        this.name = config.name;
        this.ws = config.webSocket;
    }

    setReady(board: PlayerBoard) {
        this.PosToVal = board.PosToVal;
        this.ValToPos = board.ValToPos;
        this.ready = true;
    }
}
