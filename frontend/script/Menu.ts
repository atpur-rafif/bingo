import { borderBelowAnimation } from "./Styling";
import { child, createComponent, hideable } from "./Component";


const Join = function (this: Menu) {
    const joinRoomButton = createComponent("button", { innerText: "Join" }, borderBelowAnimation);
    const joinRoomInput = createComponent("input", { type: "text", placeholder: "Room Id" });
    const joinBackButton = createComponent("button", { innerText: "Back" }, borderBelowAnimation);
    joinBackButton.addEventListener("click", () => this.setState("option"))

    return createComponent("div", { className: "join-menu" },
        hideable({
            type: "height",
            shown: false
        }),
        child([
            joinRoomInput,
            joinRoomButton,
            joinBackButton
        ])
    );
}

const Create = function (this: Menu) {
    const createRoomButton = createComponent("button", { innerText: "Create" }, borderBelowAnimation);
    const createRoomInput = createComponent("input", { type: "text", placeholder: "Room Id" });
    const createBackButton = createComponent("button", { innerText: "Back" }, borderBelowAnimation);
    createBackButton.addEventListener("click", () => this.setState("option"))

    return createComponent("div", { className: "create-menu" },
        hideable({
            type: "height",
            shown: false
        }),
        child([
            createRoomInput,
            createRoomButton,
            createBackButton
        ])
    );
}

const Option = function(this: Menu){
    const join = createComponent("button", { innerText: "Join Room" }, borderBelowAnimation)
    const create = createComponent("button", { innerText: "Create Room" }, borderBelowAnimation)

    join.addEventListener("click", () => this.setState("join"))
    create.addEventListener("click", () => this.setState("create"))

    return createComponent("div", { className: "option-menu" },
        hideable({
            type: "height",
            shown: false
        }),
        child([
            join, 
            create
        ])
    );
}



export class Menu {
    create = Create.apply(this)
    join = Join.apply(this)
    option = Option.apply(this)

    el = createComponent("div", { className: "menu" },
        hideable({
            type: "width",
            shown: true
        }),
        child([
            this.create, this.option, this.join
        ])
    );

    constructor() {
        this.setState("option");
    }

    state: "option" | "create" | "join" = "option";
    setState(newState: typeof this.state) {
        [
            this.create,
            this.option,
            this.join
        ].forEach(v => v.ext.hide());

        this[newState].ext.show();
    }

    hide() {
        this.el.ext.hide();
    }

    show() {
        this.el.ext.show();
    }


}
