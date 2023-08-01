const app = document.getElementById("app") as HTMLElement
const gameTemplate = document.getElementById("game-template") as HTMLTemplateElement
const gridTemplate = document.getElementById("grid-template") as HTMLTemplateElement

class Grid{
    el: HTMLElement
    private value: number | null = null
    private symbol: HTMLElement
    private checked: boolean = false

    constructor(){
        const frag = gridTemplate.content.cloneNode(true) as DocumentFragment
        this.el = frag.firstElementChild as HTMLElement
        this.symbol = this.el.querySelector("[data-symbol]") as HTMLElement
        this.setValue(null)
    }

    setValue(i: number | null){
        this.value = i
        if(this.value !== null){
            this.symbol.innerHTML = this.value.toString()
            this.el.style.cursor = "auto"
        } else {
            this.symbol.innerHTML = "?"
            this.el.style.cursor = "pointer"
        }
    }

    getValue(){
        return this.value
    }

    check(){
        this.checked = true
        this.el.style.opacity = "0.05"
    }
}

class Game{
    el: HTMLElement
    ready: boolean = false
    currentFill: number = 0
    grid: Grid[] = []
    state: "fill" | "filled" | "play" = "fill"

    constructor(){
        const frag = gameTemplate.content.cloneNode(true) as DocumentFragment
        this.el = frag.querySelector(".game") as HTMLElement

        for(let i = 0; i < 5 * 5; ++i){
            const g = new Grid()
            g.el.addEventListener("click", this.createClickHandler(g))
            this.el.append(g.el)
            g.el.click()
        }
    }

    createClickHandler(g: Grid){
        return () => {
            if (this.state === "fill") {
                if (g.getValue() === null) {
                    ++this.currentFill;
                    g.setValue(this.currentFill)
                }
                if (this.currentFill === 25)  this.onFilled()
            } else if(this.state === "play") {
                g.check()
            }
        }
    }

    onFilled(){
        this.state = "play"
        console.log(this)
    }
}

const game = new Game()
app.append(game.el)