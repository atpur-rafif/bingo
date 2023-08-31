type Beautify<T> = {
    [K in keyof T]: T[K]
} & {}

type Assign<A extends object, B extends object> = {
    [K in keyof (A & B)]: K extends keyof B ? B[K] : A[K & keyof A]
}

export type El = HTMLElementTagNameMap & { "el": HTMLElement }
type ElOption<K extends keyof El> = {
    [T in keyof El[K] as (El[K][T] extends string | boolean | number | null | undefined ? T : never)]?: El[K][T]
}

export type Component<K extends keyof El = "el", P extends object = {}> = El[K] & ComponentCustomProps<P>

type ComponentCustomProps<P extends object> = {
    ext: P
}

export type Extension<P extends object | null = null, K extends keyof El = "el"> = (el: El[K]) =>  P extends object ? P : void

export type ExtensionFactory<C, P extends object | null = null, K extends keyof El = "el"> = (config: C) => Extension<P, K>

type ExtensionInput = Extension<any, any> | { [key: string]: Extension<any, any> }

type ExtractExtensionReturnAll<E extends ExtensionInput[]> = 
    E extends [infer A extends ExtensionInput, ...infer B extends ExtensionInput[]] ? Beautify<Assign<ExtractExtensionReturn<A>, ExtractExtensionReturnAll<B>>> : {}

type ExtractExtensionReturn<E extends ExtensionInput> = 
    E extends (...args: infer _) => infer P ? P :
    E extends object ? { [K in keyof E]: ExtractExtensionReturn<E[K]> } :
    never

export function createComponent<K extends keyof El, E extends ExtensionInput[]>(tagName: K, options?: ElOption<K>, ...extensions: E): Component<K, ExtractExtensionReturnAll<E>> {
    const el = document.createElement(tagName) as any
    const props = {}
    Object.assign(el, options)

    const apply = (e: Extension<any, any>, name?: string) => {
        const returnedProps = e(el)
        if (returnedProps) {
            const newProps = name ? { [name]: returnedProps } : returnedProps
            Object.assign(props, newProps)
        }
    }

    extensions.forEach(e => {
        if(typeof e === "object") Object.keys(e).forEach(k => apply(e[k], k))
        else if(typeof e === "function") apply(e)
    })

    el.ext = {}
    Object.assign(el.ext, props)
    return el as any
}

/*
export const hideable: ExtensionFactory<
    {
        type: "width" | "height",
        shown: boolean
    },
    {
        hidden: boolean,
        show: () => void,
        hide: () => void,
        toggleHide: () => void
    }
> = ({ type, shown }) => {
    return () => {

        return {}

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
*/

export const child: ExtensionFactory<
    HTMLElement[]
> = (child: HTMLElement[]) => {
    return (el) => {
        el.append(...child)
    }
}

export const styling: ExtensionFactory<
    Partial<CSSStyleDeclaration>
> = (style) => {
    return (el) => {
        Object.assign(el.style,  style)
    }
}

type Emitter<P extends Record<string, any>> = <K extends keyof P>(eventName: K, ...data: P[K] extends null ? [] : [P[K]]) => void

type ListenerMutator<P extends object> = <K extends keyof P>(eventName:K, cb: (data:P[K]) => void) => void
type Listener<P extends Record<string, any>> = {
    addEventListener: ListenerMutator<P>
    removeEventListener: ListenerMutator<P>
}

type obj = {
    a: string,
    b: number
}

export const eventComponent = function <P extends Record<string, any>>(): [Emitter<P>, Extension<Listener<P>>] {
    const obj: Partial<Record<keyof P, CallableFunction[]>> = {}

    const ext: Extension<Listener<P>> = () => {
        return {
            addEventListener: (eventName: keyof P, cb: CallableFunction) => {
                if (!obj[eventName]) obj[eventName] = []
                obj[eventName]?.push(cb)
            },
            removeEventListener: (eventName: keyof P, cb: CallableFunction) => {
                const index = obj[eventName]?.indexOf(cb)
                if (index === undefined || index === -1) return
                obj[eventName]?.splice(index, 1)
            }
        }
    }

    const emitter = (eventName: keyof P, data: any) => {
        if(!obj[eventName]) return
        obj[eventName]?.forEach(cb => cb(data))
    }

    return [emitter, ext] as any
}