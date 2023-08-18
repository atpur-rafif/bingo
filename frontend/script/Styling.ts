import { Extension, child, styling, createComponent } from "./Component";

export const borderBelowAnimation: Extension<
    "element",
    {}
> = ({ el }) => {
    const belowBorder = createComponent("div", {}, styling({
        backgroundColor: "black",
        height: "0.1rem",
        width: "0rem",
        transition: "all 0.3s"

    }))

    const wrapper = createComponent("div", {},
        styling({
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }),
        child([el, belowBorder])
    )

    const show = () => {
        belowBorder.style.width = wrapper.getBoundingClientRect().width + "px"
    }

    const hide = () => {
        belowBorder.style.width = "0px"
    }

    wrapper.addEventListener("pointerover", show)
    wrapper.addEventListener("pointerleave", hide)
    wrapper.addEventListener("focusin", show)
    wrapper.addEventListener("focusout", hide)

    return {
        newEl: wrapper,
        props: {}
    }
}