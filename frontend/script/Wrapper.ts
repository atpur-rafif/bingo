import { Component, El, createComponent } from "./Component"

type Wrapped<C extends HTMLElement, K extends keyof El, P extends object> = El[K] & { 
    core: C
    wrapperExt: P
} & (C extends Component<infer _, infer Q> ? { ext: Q } : {})

type Wrapper<P extends object = {}, K extends keyof El = "el"> = <C extends HTMLElement>(input: C) => Wrapped<C, K, P>

const WrapperFactory = <K extends keyof El, P extends object>(cb: (input: HTMLElement) => { newEl: El[K], props: P }) => {
    const fn: Wrapper<P, K> = (input) => {
        const { newEl, props } = cb(input)
        Object.assign(newEl, { wrapperExt: props, core: input })

        if("ext" in input) Object.assign(newEl, { ext: input.ext })
        if("wrapperExt" in input) Object.assign(newEl, { wrapperExt: input.wrapperExt })

        return newEl as any
    }
    return fn
}

const testWrapper = WrapperFactory((input) => {
    const wrapper = document.createElement("div")
    wrapper.append(input)

    return {
        newEl: wrapper,
        props: {
            test(){
                wrapper.append("FJDKSLFJ")
            }
        }
    }
})

setTimeout(() => {
    const app = document.getElementById("app") as HTMLElement
    app.innerHTML = ""

    const p = createComponent("div", { innerHTML: "HELLO" })
    const q = testWrapper(p)
    app.append(q)
    console.log(q.ext)
    setTimeout(() => {
        q.wrapperExt.test()
    }, 100);
}, 100);