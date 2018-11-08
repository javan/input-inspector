import { Controller } from "stimulus"
import { diffChars } from "diff"
import { Timeline } from "../models/timeline"

export default class extends Controller {
  static targets = [ "editor", "entries" ]

  initialize() {
    this.timeline = new Timeline
    this.startObserver()
    this.editorTarget.focus()
  }

  record(object) {
    this.timeline.record(object)
    this.render()
  }

  // Private

  startObserver() {
    const observer = new MutationObserver(mutations => {
      Array.from(mutations, mutation => this.record(mutation))
    })
    observer.observe(this.editorTarget, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    })
  }

  render() {
    if (this.rendering) return
    this.rendering = true
    this.renderIndex || (this.renderIndex = 0)

    requestAnimationFrame(() => {
      const entries = this.timeline.slice(this.renderIndex)
      const { entriesTarget } = this
      entries.forEach((entry, index) => {
        const html = views.entry(entry, index + this.renderIndex + 1)
        entriesTarget.insertAdjacentHTML("afterbegin", html)
      })
      this.rendering = false
      this.renderIndex += entries.length
    })
  }
}

const views = {
  entry: (entry, index) => {
    return `
      <tr class="${entry.constructorName}">
        <td>${index}</td>
        <td>${format(entry.constructorName)}</td>
        <td>${format(entry.data.type)}</td>
        ${views[entry.constructorName](entry.data)}
      </tr>
    `
  },

  KeyboardEvent: (data) => {
    return `
      <td>${format(data.code)}</td>
      <td>${format(data.key)}</td>
      ${views.event(data)}
    `
  },

  InputEvent: (data) => {
    return `
      <td>${format(data.inputType)}</td>
      <td>${format(data.data)}</td>
      ${views.event(data)}
    `
  },

  CompositionEvent: (data) => {
    return `
      <td colspan="2">${format(data.data)}</td>
      ${views.event(data)}
    `
  },

  event: (data) => {
    return `
      <td class="entry-col--symbol">${views.eventKeys(data)}</td>
      <td class="entry-col--symbol">${format(data.cancelable)}</td>
      <td class="entry-col--symbol">${format(data.isComposing)}</td>
      <td class="entry-col--symbol">${format(data.repeat)}</td>
    `
  },

  eventKeys: (data) => {
    const keys = []
    if (data.altKey)   keys.push("option")
    if (data.ctrlKey)  keys.push("control")
    if (data.metaKey)  keys.push("command")
    if (data.shiftKey) keys.push("shift")
    return keys.length
      ? keys.map(key => `<kbd>${key}</kbd>`).join("")
      : format(null)
  },

  MutationRecord: (data) => {
    return `
      <td colspan="6">
        ${views[`${data.type}Mutation`](data)}
      </td>
    `
  },

  characterDataMutation: (data) => {
    const diff = diffChars(data.oldValue, data.newValue)
    const diffHTML = diff.map(part => {
      const tagName = part.added ? "ins" : part.removed ? "del" : "span"
      return `<${tagName} class="diff diff--text">${format(part.value)}</${tagName}>`
    }).join("")
    return `<span class="node node--text">${diffHTML}</span>`
  },

  childListMutation: (data) => {
    return data.removedNodes.map(({ type, value }) =>
      `<ins class="diff diff--node"><span class="node node--${type}">${format(value)}</span></ins>`
    ).concat(data.addedNodes.map(({ type, value }) =>
      `<del class="diff diff--node"><span class="node node--${type}">${format(value)}</span></del>`
    )).join("<br>")
  }
}

function format(value) {
  if (typeof value == "undefined" || value == null) {
    return `<span class="symbol symbol--null">∅</span>`
  }
  if (typeof value == "boolean") {
    return value
      ? `<span class="symbol symbol--true">✓</span>`
      : `<span class="symbol symbol--false">×</span>`
  }
  return escape(value)
}

const escapeElement = document.createElement("div")
function escape(html) {
  escapeElement.textContent = html
  return escapeElement.innerHTML
}
