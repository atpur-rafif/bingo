import { borderBelowAnimation } from "./Styling";
import { child, createComponent, eventComponent, hideable, styling } from "./Component";
import { EventManager } from "./Event";

const Option = function(){
    const [emit, eventExt] = eventComponent<{
        choose: "join" | "create"
    }>()

    const join = createComponent("button", {
        innerText: "Join Room",
        ariaLabel: "join"
    }, borderBelowAnimation)
    const create = createComponent("button", { innerText: "Create Room" }, borderBelowAnimation)

    join.addEventListener("click", () => emit("choose", "join"))
    create.addEventListener("click", () => emit("choose", "create"))

    return createComponent("div", { className: "option-menu" },
        eventExt,
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

const Create = function () {
    const [emit, eventExt] = eventComponent<{
        cancel: null,
        create: {
            name: string
        }
    }>()

    const createRoomButton = createComponent("button", { innerText: "Create" }, borderBelowAnimation);
    const createRoomInput = createComponent("input", { type: "text", placeholder: "Name" });
    const createBackButton = createComponent("button", { innerText: "Back" }, borderBelowAnimation);
    createBackButton.addEventListener("click", () => emit("cancel"))
    createRoomButton.addEventListener("click", () => {
        emit("create", { name: createRoomInput.core.value })
    })

    return createComponent("div", { className: "create-menu" },
        eventExt,
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

const Join = function () {
    const [emit, eventExt] = eventComponent<{
        "cancel": null
    }>()

    const joinRoomButton = createComponent("button", { innerText: "Join" }, borderBelowAnimation);
    const joinRoomInput = createComponent("input", { type: "text", placeholder: "Room Id" });
    const joinBackButton = createComponent("button", { innerText: "Back" }, borderBelowAnimation);
    joinBackButton.addEventListener("click", () => emit("cancel"))

    joinRoomButton.addEventListener("click", () => {

    })

    return createComponent("div", { className: "join-menu" },
        eventExt,
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

const Waiting = function(){
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

const Loading = function(){
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

export class Menu {
    eventManager: EventManager
    constructor(eventManager: EventManager) {
        this.eventManager = eventManager
        this.setState("option");

        this.option.ext.addEventListener("choose", (opt) => this.setState(opt))

        ;[this.create, this.join].forEach(v => v.ext.addEventListener("cancel", () => {
            this.setState("option")
        }))

        this.create.ext.addEventListener("create", (d) => {
            console.log(d.name)
        })
    }

    create = Create()
    join = Join()
    option = Option()
    waiting = Waiting()
    loading = Loading()

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
