import { diffChars } from "diff"
import { TimelineEntrySnapshotView } from "./timeline_entry_snapshot_view"

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
        <td class="snapshot-container" tabindex="0">
          <span class="snapshot-trigger">${this.index}</span>
          <div class="snapshot">${TimelineEntrySnapshotView.render(this.entry)}</div>
        </td>
        <td>${format(this.data.type || this.entry.type)}</td>
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
    const { data, dataTransfer, inputType } = this.data
    return `
      <td>${dataTransfer && Object.keys(dataTransfer).length
        ? `<details class="event-data-transfer"><summary>dataTransfer</summary>${formatDataTransfer(dataTransfer)}</details>`
        : `<span class="event-data event-data--${typeof(data)}">${format(data)}</span>`}
      </td>
      <td>${format(inputType)}</td>
      ${this.eventDetails()}
    `
  }

  CompositionEvent() {
    const { data } = this.data
    return `
      <td colspan="2"><span class="event-data event-data--${typeof(data)}">${format(data)}</span></td>
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

  AnimationFrame() {
    return `
      <td colspan="6"></td>
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
      `<del class="diff diff--node"><span class="node node--${type}">${format(value)}</span></del>`
    ).concat(this.data.addedNodes.map(({ type, value }) =>
      `<ins class="diff diff--node"><span class="node node--${type}">${format(value)}</span></ins>`
    )).join("<br>")
  }
}

function formatDataTransfer(dataTransfer) {
  const { types, files } = dataTransfer
  const lines = []
  if (types && Object.keys(types).length) {
    for (const type in types) {
      lines.push(`<strong>${escape(type)}:</strong>`)
      if (type == "Files") {
        for (const file of files) {
          lines.push(` - ${JSON.stringify(file)}`)
        }
      } else {
        const value = types[type]
        const rows = Math.ceil(value.length / 20)
        lines.push(`<textarea rows="${rows}" readonly>${escape(value)}</textarea>`)
      }
    }
  }
  return lines.join("<br>")
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
