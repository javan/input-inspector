const elements = {
  editor: document.getElementById("editor"),
  entriesHeader: document.getElementById("entries-header"),
  entriesBody: document.getElementById("entries-body"),
}

requestAnimationFrame(() => elements.editor.focus())

const records = []

const eventNames = [
  "beforeinput",
  "compositionend",
  "compositionstart",
  "compositionupdate",
  "input",
  "keydown"
]

eventNames.forEach(eventName =>
  elements.editor.addEventListener(eventName, recordEvent)
)

new MutationObserver(records =>
  Array.from(records).forEach(recordMutation)
).observe(elements.editor, {
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: true
})

function recordEvent(event) {
  const { type, key, code, cancelable, isComposing, inputType, data } = event
  const constructorName = event.constructor.name
  record("event", { constructorName, type, key, code, cancelable, isComposing, inputType, data })
}

function recordMutation(mutation) {
  const { type, target, oldValue, removedNodes, addedNodes } = mutation
  const constructorName = mutation.constructor.name
  const data = { type, constructorName }

  if (type == "characterData") {
    const oldTarget = target.cloneNode()
    oldTarget.nodeValue = oldValue
    data.oldNode = format(oldTarget)
    data.newNode = format(target)
  }
  if (type == "childList") {
    data.removedNodes = Array.from(removedNodes, (node) => format(node))
    data.addedNodes = Array.from(addedNodes, (node) => format(node))
  }

  record("mutation", data)
}

function record(type, entry) {
  const time = performance.now()
  records.push({ type, time, entry })
  render()
}

let rendering = false
function render() {
  if (rendering) return
  rendering = true
  requestAnimationFrame(() => {
    rendering = false
    elements.entriesHeader.hidden = records.length == 0
    elements.entriesBody.innerHTML = records.map((record, index) => `
      <tr class="${record.entry.constructorName}">
        <td>${index + 1}</td>
        <td>${format(record.entry.constructorName)}</td>
        ${renderers[record.type](record.entry)}
      </tr>
    `).reverse().join("\n")
  })
}

const renderers = {
  event: (entry) => {
    const { type, key, code, cancelable, isComposing, inputType, data } = entry
    return `
      <td>${format(type)}</td>
      <td>${escape(format(key))}</td>
      <td>${format(code)}</td>
      <td>${format(cancelable)}</td>
      <td>${format(isComposing)}</td>
      <td>${format(inputType)}</td>
      <td>${escape(format(data))}</td>
    `
  },

  mutation: (entry) => {
    const lines = []
    if (entry.type == "characterData") {
      lines.push(`${entry.oldNode} → ${entry.newNode}`)
    }
    if (entry.type == "childList") {
      Array.from(entry.addedNodes).forEach(node => {
        lines.push(`+ ${node}`)
      })
      Array.from(entry.removedNodes).forEach(node => {
        lines.push(`- ${node}`)
      })
    }
    return `
      <td>${format(entry.type)}</td>
      <td colspan="6">
        ${lines.map(line => escape(line)).join("<br>")}
      </td>
    `
  }
}

function format(value) {
  if (typeof value == "undefined" || value == null) {
    return "∅"
  }
  if (typeof value == "boolean") {
    return value ? "✓" : "×"
  }
  if (value instanceof Node) {
    if (value.nodeType == Node.ELEMENT_NODE) {
      return value.outerHTML
    } else {
      return `<${value.nodeName}>"${value.nodeValue}"`
    }
  }
  return String(value)
}

const escapeElement = document.createElement("div")
function escape(html) {
  escapeElement.textContent = html
  return escapeElement.innerHTML
}
