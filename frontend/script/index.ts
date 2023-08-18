import { borderBelowAnimation } from "./Styling"
import { child, createComponent, hideable } from "./Component"

const app = document.getElementById("app") as HTMLElement
console.log(app)

class Menu{
    optionButton = {
        join: createComponent("button", { innerText: "Join Room" }, borderBelowAnimation),
        create: createComponent("button", { innerText: "Create Room" }, borderBelowAnimation)
    }

    optionContainer = createComponent("div", { className: "option-menu" },
        hideable({
            type: "height",
            shown: false
        }),
        child([
            this.optionButton.join,
            this.optionButton.create
        ])
    )

    joinRoomButton = createComponent("button", { innerText: "Join" }, borderBelowAnimation)
    joinRoomInput = createComponent("input", { type: "text", placeholder: "Room Id" })
    joinBackButton = createComponent("button", { innerText: "Back" }, borderBelowAnimation)
    joinContainer = createComponent("div", { className: "join-menu" },
        hideable({
            type: "height",
            shown: false
        }),
        child([
            this.joinRoomInput,
            this.joinRoomButton,
            this.joinBackButton
        ])
    )

    createRoomButton = createComponent("button", { innerText: "Create" }, borderBelowAnimation)
    createRoomInput = createComponent("input", { type: "text", placeholder: "Room Id" })
    createBackButton = createComponent("button", { innerText: "Back" }, borderBelowAnimation)
    createContainer = createComponent("div", { className: "create-menu" }, 
        hideable({
            type: "height",
            shown: false
        }),
        child([
            this.createRoomInput,
            this.createRoomButton,
            this.createBackButton
        ])
    )

    el = createComponent("div", { className: "menu" }, 
        hideable({
            type: "width",
            shown: true
        }),
        child([
            this.optionContainer,
            this.createContainer,
            this.joinContainer
        ])
    )

    constructor() {
        this.setState("option")
        this.optionButton.join.core.addEventListener("click", () => {
            this.setState("join")
        })

        this.optionButton.create.core.addEventListener("click", () => {
            this.setState("create")
        })

        ;[this.createBackButton, this.joinBackButton].forEach(v => v.core.addEventListener("click", () => {
            this.setState("option")
        }))

        this.createRoomButton.core.addEventListener("click", () => {
            const room = this.createRoomInput.core.value
            console.log(room, "Create")
        })

        this.joinRoomButton.core.addEventListener("click", () => {
            const room = this.joinRoomInput.core.value
            console.log(room, "Join")
        })

        setTimeout(() => {
            this.setState("join")
        }, 0);
    }

    state: "option" | "create" | "join" = "option"
    setState(newState: typeof this.state){
        [
            this.optionContainer,
            this.createContainer,
            this.joinContainer
        ].forEach(v => v.ext.hide())

        this[`${newState}Container`].ext.show()
    }

    hide(){
        this.el.ext.hide()
    }

    show(){
        this.el.ext.show()
    }

    
}

class Game {

}

const menu = new Menu()
app.append(menu.el)