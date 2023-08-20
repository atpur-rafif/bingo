import "./test"
import "./Event"
import { EventManager } from "./Event"
import { Menu } from "./Menu"

const app = document.getElementById("app") as HTMLElement

class Game {

}

const eventManager = new EventManager()
const menu = new Menu(eventManager)
app.append(menu.el)