import { diffChars } from "diff"

export class TimelineEntryView {
  static render(...args) {
    return new this(...args).render()
  }

  constructor(entry, index) {
    this.entry = entry
    this.index = index
  }

  get data() {
    return this.entry.data
  }

  render() {
    const { constructorName } = this.entry
    return `
      <tr class="${constructorName}">
        <td>${this.index}</td>
        <td>${format(constructorName)}</td>
        <td>${format(this.data.type)}</td>
        ${this[constructorName]()}
      </tr>
    `
  }

  // Private

  KeyboardEvent(){
    return `
      <td>${format(this.data.key)}</td>
      <td>${format(this.data.code)}</td>
      ${this.eventDetails()}
    `
  }

  InputEvent() {
    return `
      <td>${format(this.data.data)}</td>
      <td>${format(this.data.inputType)}</td>
      ${this.eventDetails()}
    `
  }

  CompositionEvent() {
    return `
      <td colspan="2">${format(this.data.data)}</td>
      ${this.eventDetails()}
    `
  }

  MutationRecord() {
    return `
      <td colspan="6">
        ${this[`${this.data.type}Mutation`]()}
      </td>
    `
  }

  eventDetails() {
    return `
      <td>${this.eventKeys()}</td>
      <td>${format(this.data.repeat)}</td>
      <td>${format(this.data.isComposing)}</td>
      <td>${format(this.data.cancelable)}</td>
    `
  }

  eventKeys() {
    const keys = []
    if (this.data.altKey)   keys.push("option")
    if (this.data.ctrlKey)  keys.push("control")
    if (this.data.metaKey)  keys.push("command")
    if (this.data.shiftKey) keys.push("shift")
    return keys.length
      ? keys.map(key => `<kbd>${key}</kbd>`).join("")
      : format(null)
  }

  characterDataMutation() {
    const diff = diffChars(this.data.oldValue, this.data.newValue)
    return diff.map(part => {
      const tagName = part.added ? "ins" : part.removed ? "del" : "span"
      return `<${tagName} class="diff diff--text">${format(part.value)}</${tagName}>`
    }).join("")
  }

  childListMutation() {
    return this.data.removedNodes.map(({ type, value }) =>
      `<ins class="diff diff--node"><span class="node node--${type}">${format(value)}</span></ins>`
    ).concat(this.data.addedNodes.map(({ type, value }) =>
      `<del class="diff diff--node"><span class="node node--${type}">${format(value)}</span></del>`
    )).join("<br>")
  }
}

function format(value) {
  if (typeof value == "undefined" || value == null) {
    return `<abbr title="null or undefined" class="symbol symbol--null">∅</abbr>`
  }
  if (typeof value == "boolean") {
    return value
      ? `<abbr title="true" class="symbol symbol--true">✓</abbr>`
      : `<abbr title="false" class="symbol symbol--false">×</abbr>`
  }
  return escape(value)
}

const escapeElement = document.createElement("div")
function escape(html) {
  escapeElement.textContent = html
  return escapeElement.innerHTML
}
