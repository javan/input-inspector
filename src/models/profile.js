import { Timeline } from "./timeline"

export class Profile {
  static create() {
    return new this({
      timeline: new Timeline,
      browser: getBrowserInfo()
    })
  }

  static fromJSON(data) {
    return new this({
      ...data,
      timeline: new Timeline(data.timeline),
      createdAt: new Date(data.createdAt.seconds * 1000)
    })
  }

  static async load(id) {
    const db = await loadDB()
    const data = await db.load("profiles", id)
    return data ? this.fromJSON(data) : data
  }

  constructor(data) {
    Object.assign(this, slice(data, "id", "browser", "timeline", "createdAt"))
  }

  async save() {
    if (this.id) return false
    const db = await loadDB()
    const { id } = await db.create("profiles", this)
    this.id = id
    return this
  }
}

async function loadDB() {
  return import(/* webpackChunkName: "db" */ "../db")
}

function getBrowserInfo() {
  const browser = {}
  browser.window = slice(window, "devicePixelRatio")
  browser.navigator = slice(window.navigator, "language", "languages", "platform", "userAgent")
  browser.screen = slice(window.screen, "width", "height")
  browser.screen.orientation = slice(window.screen.orientation, "angle", "type")
  return browser
}

function slice(object = {}, ...keys) {
  const result = {}
  keys.forEach(key => {
    const value = object[key]
    if (typeof value != "undefined") {
      result[key] = value
    }
  })
  return result
}
