type Beautify<T> = {
    [K in keyof T]: T[K]
} & {}

type Assign<A extends object, B extends object> = {
    [K in keyof (A & B)]: K extends keyof B ? B[K] : A[K & keyof A]
}

type El = HTMLElementTagNameMap & { "element": HTMLElement }
type ElOption<K extends keyof El> = {
    [T in keyof El[K] as (El[K][T] extends string | boolean | number ? T : never)]?: El[K][T]
}

type Component<K extends keyof El, P extends object> = HTMLElement & ComponentCustomProps<K, P>

type ComponentCustomProps<K extends keyof El, P extends object> = {
    core: El[K],
    ext: P
}

export type Extension<K extends keyof El, P extends object> = (args: { core: El[K], el: HTMLElement }) => {
    newEl?: HTMLElement
    props: P
}

export type ExtensionFactory<C, K extends keyof El, P extends object> = (config: C) => Extension<K, P>

type ExtensionInput = Extension<any, any> | { [key: string]: Extension<any, any> }

type ExtractExtensionReturnAll<E extends ExtensionInput[]> = 
    E extends [infer A extends ExtensionInput, ...infer B extends ExtensionInput[]] ? Beautify<Assign<ExtractExtensionReturn<A>, ExtractExtensionReturnAll<B>>> : {}

type ExtractExtensionReturn<E extends ExtensionInput> = 
    E extends Extension<infer _, infer P> ? P :
    E extends object ? { [K in keyof E]: ExtractExtensionReturn<E[K]> } :
    never

export function createComponent<K extends keyof El, E extends ExtensionInput[]>(tagName: K, options?: ElOption<K>, ...extensions: E): Component<K, ExtractExtensionReturnAll<E>> {
    let el = document.createElement(tagName) as any
    const core = el
    const props = {}
    Object.assign(el, options)

    const apply = (e: Extension<any, any>, name?: string) => {
        const r = e({ core, el })
        if(r.newEl) el = r.newEl

        const p = name ? { [name]: r.props } : r.props
        Object.assign(props, p)
    }

    extensions.forEach(e => {
        if(typeof e === "object") Object.keys(e).forEach(k => apply(e[k], k))
        else if(typeof e === "function") apply(e)
    })

    el.ext = {}
    Object.assign(el.ext, props)
    el.core = core
    return el as any
}

export const hideable: ExtensionFactory<
    {
        type: "width" | "height",
        shown: boolean
    },
    "element",
    {
        hidden: boolean,
        show: () => void,
        hide: () => void,
        toggleHide: () => void
    }
> = ({ type, shown }) => {
    return ({ el }) => {
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
                    if(this.hidden) this.show()
                    else this.hide()
                },
            }
        }
    }
}

export const child: ExtensionFactory<
    HTMLElement[],
    "element",
    {}
> = (child: HTMLElement[]) => {
    return ({ core }) => {
        core.append(...child)
        return {
            props: {}
        }
    }
}

export const styling: ExtensionFactory<
    Partial<CSSStyleDeclaration>,
    "element",
    {}
> = (style, type: "core" | "el" = "el") => {
    return ({ core, el }) => {
        const target = type === "el" ? el : core
        Object.assign(target.style,  style)
        return {
            props: {}
        }
    }
}