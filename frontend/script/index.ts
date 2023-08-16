const app = document.getElementById("app") as HTMLDivElement

type Component = HTMLElementTagNameMap
type ComponentOption<K extends keyof Component> = {
    [T in keyof Component[K] as (Component[K][T] extends string | boolean | number ? T : never)]?: Component[K][T]
}

function comp<K extends keyof Component>(tagName: K, option?: ComponentOption<K>, childs?: string | HTMLElement[]): Component[K]{
    const el = document.createElement(tagName)
    Object.assign(el, option)
    if (Array.isArray(childs)) childs.forEach(c => el.appendChild(c))
    if (typeof childs === "string") el.innerHTML = childs
    return el
}

/*
type HideableOption = {
    type: "vertical" | "horizontal"
}

const defaultHideableOption: HideableOption = {
    type: "vertical"
}

function makeHideable<K extends keyof HTMLElementTagNameMap>(component: Component[K], option: Partial<HideableOption> = defaultHideableOption): Component[K]{
    Object.assign(defaultHideableOption, option)
    
    return "" as any
}
*/

const option = comp("div", { className: "LMao" }, [
    comp("button", {}, "Hello"),
    comp("button", {}, "Helo")
])

app.append(comp("div", {}, [
    option
]))