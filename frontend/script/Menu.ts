import { borderBelowAnimation } from "./Styling";
import { child, createComponent, hideable, styling } from "./Component";


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
    createRoomButton.addEventListener("click", () => this.setState("waiting"))
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
            create, 
            join
        ])
    );
}

const Waiting = function(this: Menu){
    const user = ["A", "B", "C"]

    const list = createComponent("div", {},
        styling({
            display: "flex",
            flexDirection: "column"
        })
    )
    user.forEach(v => {
        list.append(createComponent("div", {innerText: v}))
    })

    const startButton = createComponent("button", { innerText: "Start Game" }, borderBelowAnimation) 
    const cancelButton = createComponent("button", { innerText: "Cancel Game"}, borderBelowAnimation)
    const buttonContainer = createComponent("div", {}, 
        styling({
            display: "flex",
            flexDirection: "row",
            gap: "1rem"
        }),
        child([startButton, cancelButton])
    )

    return createComponent("div", {},
        styling({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem"
        }),
        hideable({
            type: "height",
            shown: false
        }),
        child([
            list,
            buttonContainer
        ])
    )
}

export class Menu {
    create = Create.apply(this)
    join = Join.apply(this)
    option = Option.apply(this)
    waiting = Waiting.apply(this)

    el = createComponent("div", { className: "menu" },
        hideable({
            type: "width",
            shown: true
        }),
        child([
            this.option, this.create, this.join, this.waiting
        ])
    );

    constructor() {
        this.setState("option");

        setTimeout(() => {
            this.setState("waiting")
        }, 100);
    }

    state: "option" | "create" | "join" | "waiting" = "option";
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
