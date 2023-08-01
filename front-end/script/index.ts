const app = document.getElementById("app") as HTMLElement
const gameTemplate = document.getElementById("game-template") as HTMLTemplateElement
const gridTemplate = document.getElementById("grid-template") as HTMLTemplateElement

class Grid{
    el: HTMLElement
    private value: number | null = null
    private symbol: HTMLElement
    private checked: boolean = false

    constructor(pos: number){
        const frag = gridTemplate.content.cloneNode(true) as DocumentFragment
        this.el = frag.firstElementChild as HTMLElement
        this.el.setAttribute("data-pos", pos.toString())
        this.symbol = this.el.querySelector("[data-symbol]") as HTMLElement
        this.setValue(null)
    }

    setValue(i: number | null){
        this.value = i
        if(this.value !== null) this.symbol.innerHTML = this.value.toString()
        else this.symbol.innerHTML = "?"
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
    size: number = 2
    el: HTMLElement
    ready: boolean = false
    currentFill: number = 0
    grids: Grid[] = []
    state: "fill" | "play" | undefined
    PosToVal: Record<number, number> = {}
    ValToPos: Record<number, number> = {}

    constructor(){
        const frag = gameTemplate.content.cloneNode(true) as DocumentFragment
        this.el = frag.querySelector(".game") as HTMLElement
        this.el.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`
        this.el.style.gridTemplateRows = `repeat(${this.size}, 1fr)`

        for(let i = 0; i < this.size ** 2; ++i){
            const g = new Grid(i)
            this.grids.push(g)
            this.el.append(g.el)
        }

        this.onStartFill()
    }

    getPosFromEvent(e: Event){
        return parseInt((e.currentTarget as any).getAttribute("data-pos"))
    }

    onStartFill(){
        this.state = "fill"
        this.grids.forEach(g => {
            g.el.addEventListener("click", this.onFill)
            g.el.classList.add("fill")
        })

        requestAnimationFrame(() => {
            this.grids.forEach(g => g.el.click())
        })
    }

    onFill = (e: Event) => {
        const index = this.getPosFromEvent(e)
        const grid = this.grids[index]

        if(grid.getValue() === null){
            ++this.currentFill
            grid.setValue(this.currentFill)
            grid.el.classList.remove("fill")
            grid.el.classList.add("filled")

            this.PosToVal[index] = this.currentFill
            this.ValToPos[this.currentFill] = index
        }

        if(this.currentFill === this.size ** 2) this.onEndFill()
    }

    onEndFill(){
        this.grids.forEach(g => {
            g.el.removeEventListener("click", this.onFill)
            g.el.classList.remove("filled")
        })
        this.state = undefined

        this.onStartPlay()
    }

    onStartPlay(){
        this.state = "play"
        this.grids.forEach(g => {
            g.el.addEventListener("click", this.onPlay)
            g.el.classList.add("play")
        })

        requestAnimationFrame(() => {
            this.grids.forEach(g => g.el.click())
        })
    }

    onPlay = (e: Event) => {
        const index = this.getPosFromEvent(e)
        const grid = this.grids[index]
        grid.el.classList.remove("play")
        grid.el.classList.add("played")
        grid.check()
    }

    onEndPlay(){
        this.grids.forEach(g => {
            g.el.classList.remove("played")
        })
        console.log("Over")
    }
}

const game = new Game()
app.append(game.el)