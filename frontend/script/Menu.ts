import { borderBelowAnimation } from "./Styling";
import { child, createComponent, hideable, styling } from "./Component";
import { EventManager } from "./Event";


const Join = function (this: Menu) {
    const joinRoomButton = createComponent("button", { innerText: "Join" }, borderBelowAnimation);
    const joinRoomInput = createComponent("input", { type: "text", placeholder: "Room Id" });
    const joinBackButton = createComponent("button", { innerText: "Back" }, borderBelowAnimation);
    joinBackButton.addEventListener("click", () => this.setState("option"))

    joinRoomButton.addEventListener("click", () => {

    })

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

const Loading = function(this: Menu){
    const loadingText = createComponent("div")

    return createComponent("div", {}, 
        hideable({
            type: "height",
            shown: false
        }),
        child([
            loadingText
        ]),
        () => {
            return {
                props: {
                    setText(text: string){
                        loadingText.innerText = text
                    }
                }
            }
        }
    )
}

const Create = function (this: Menu) {
    const createRoomButton = createComponent("button", { innerText: "Create" }, borderBelowAnimation);
    const createRoomInput = createComponent("input", { type: "text", placeholder: "Name" });
    const createBackButton = createComponent("button", { innerText: "Back" }, borderBelowAnimation);
    createBackButton.addEventListener("click", () => this.setState("option"))

    createRoomButton.addEventListener("click", () => {
        this.startLoading("Creating room...")
        this.eventManager.send("create", {
            name: createRoomInput.core.value,
            size: 5
        })

        this.eventManager.addEventListener("created", () => {
            this.setState("waiting")
        })
    })

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
    const join = createComponent("button", {
        innerText: "Join Room",
        ariaLabel: "join"
    }, borderBelowAnimation)
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
    eventManager: EventManager
    constructor(eventManager: EventManager) {
        this.eventManager = eventManager
        this.setState("option");
    }

    create = Create.apply(this)
    join = Join.apply(this)
    option = Option.apply(this)
    waiting = Waiting.apply(this)
    loading = Loading.apply(this)

    el = createComponent("div", { className: "menu" },
        hideable({
            type: "width",
            shown: true
        }),
        child([
            this.option, this.create, this.join, this.waiting, this.loading
        ])
    );

    state: "option" | "create" | "join" | "waiting" | "loading" = "option";
    setState(newState: typeof this.state) {
        [
            this.create,
            this.option,
            this.join,
            this.loading
        ].forEach(v => v.ext.hide());

        this[newState].ext.show();
    }

    startLoading(text?:string){
        this.loading.ext.setText(text ? text : "Loading")
        this.setState("loading")
    }

    hide() {
        this.el.ext.hide();
    }

    show() {
        this.el.ext.show();
    }
}
