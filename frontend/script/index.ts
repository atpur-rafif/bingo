import "./Event"
import { Menu } from "./Menu"

const app = document.getElementById("app") as HTMLElement

class Game {

}

const menu = new Menu()
app.append(menu.el)