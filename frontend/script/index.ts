const app = document.getElementById("app") as HTMLDivElement

type Tag = HTMLElementTagNameMap
type ComponentOption<K extends keyof Tag> = {
    [T in keyof Tag[K] as (Tag[K][T] extends string | boolean | number ? T : never)]?: Tag[K][T]
}

class Component<K extends keyof Tag>{
    base: Tag[K]
    el: HTMLElement

    constructor(tagName: K, option?: ComponentOption<K>, childs?: string | HTMLElement[]) {
        this.base = document.createElement(tagName)
        Object.assign(this.base, option)
        if (Array.isArray(childs)) childs.forEach(c => this.base.appendChild(c))
        if (typeof childs === "string") this.base.innerHTML = childs

        this.el = this.base
    }

    wrapWith(wrapper: HTMLElement){
        wrapper.style.color = "red"
        if (this.el.isConnected) this.el.parentNode?.insertBefore(wrapper, this.el)
        wrapper.append(this.base)
        this.el = wrapper
    }
}