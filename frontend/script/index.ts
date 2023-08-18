const app = document.getElementById("app") as HTMLDivElement

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

type Extension<K extends keyof El, P extends object> = (args: { core: El[K], el: HTMLElement }) => {
    newEl?: HTMLElement
    props: P
}

type ExtensionFactory<C extends object, K extends keyof El, P extends object> = (config: C) => Extension<K, P>

type ExtensionInput = Extension<any, any> | { [key: string]: Extension<any, any> }

type ExtractExtensionReturnAll<E extends ExtensionInput[]> = 
    E extends [infer A extends ExtensionInput, ...infer B extends ExtensionInput[]] ? Beautify<Assign<ExtractExtensionReturn<A>, ExtractExtensionReturnAll<B>>> : {}

type ExtractExtensionReturn<E extends ExtensionInput> = 
    E extends Extension<infer _, infer P> ? P :
    E extends object ? { [K in keyof E]: ExtractExtensionReturn<E[K]> } :
    never

function test<K extends keyof El, E extends ExtensionInput[]>(tagName: K, ...extensions: E): Component<K, ExtractExtensionReturnAll<E>> {
    return undefined as any
}

const a = "" as any as Extension<"element", { a: string }>
const b = "" as any as Extension<"element", { b: string }>

const p = test("div", { a, b }, a)