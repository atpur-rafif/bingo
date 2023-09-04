import { Component, El, createComponent } from "./Component"

type Wrapped<C extends HTMLElement, K extends keyof El, P extends object> = El[K] & { 
    core: C
    wrapperExt: P
} & (C extends Component<infer _, infer Q> ? { ext: Q } : {})

type Wrapper<C extends object, P extends object = {}, K extends keyof El = "el"> = <I extends HTMLElement>(el: I, config: C) => Wrapped<I, K, P>

const WrapperFactory = <C extends object, P extends object = {}, K extends keyof El = "el">(cb: (el: HTMLElement, config: C) => { newEl: El[K], props: P }) => {
    const fn: Wrapper<C, P, K> = (input, config) => {
        const { newEl, props } = cb(input, config)

        const wrapperExt = {}
        if("wrapperExt" in input){
            Object.assign(wrapperExt, input.wrapperExt)
        }
        Object.assign(wrapperExt, props)
        Object.assign(newEl, { wrapperExt, newEl })

        if("ext" in input) Object.assign(newEl, { ext: input.ext })
        return newEl as any
    }
    return fn
}

export const hideableWrapper = WrapperFactory<{
    type: "width" | "height",
    shown: boolean
}, {
    hidden: boolean,
    show: () => void,
    hide: () => void,
    toggleHide: () => void
}>((el, { type, shown }) => {
    const className = `hide-${type} ${shown ? "show" : ""}`
    const wrapper = createComponent("div", { className })
    wrapper.append(el)

    return {
        newEl: wrapper,
        props: {
            hidden: shown,
            hide() {
                wrapper.classList.remove("show")
                this.hidden = true
            },
            show() {
                wrapper.classList.add("show")
                this.hidden = false
            },
            toggleHide() {
                if (this.hidden) this.show()
                else this.hide()
            },
        }
    }
})
