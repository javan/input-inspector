import { diffChars } from "diff"

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
  elements.editor.addEventListener(eventName, record)
)

new MutationObserver(mutations =>
  Array.from(mutations).forEach(record)
).observe(elements.editor, {
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: true
})

function record(object) {
  let type
  if (object instanceof Event) {
    type = "event"
  } else if (object instanceof MutationRecord) {
    type = "mutation"
  }
  const constructorName = object.constructor.name
  const time = performance.now()
  const data = serializers[type](object)
  records.push({ type, constructorName, time, data })
  render()
}

let rendering = false
let renderIndex = 0
function render() {
  if (rendering) return
  rendering = true
  requestAnimationFrame(() => {
    rendering = false
    const newRecords = records.slice(renderIndex)
    newRecords.forEach((record, index) => {
      elements.entriesBody.insertAdjacentHTML("afterbegin", `
        <tr class="${record.constructorName}">
          <td>${index + renderIndex + 1}</td>
          <td>${format(record.constructorName)}</td>
          ${renderers[record.type](record.data)}
        </tr>
      `)
    })
    renderIndex += newRecords.length
  })
}

const serializers = {
  event: (event) => {
    const data = {}
    for (const key in event) {
      const value = event[key]
      if (/string|number|boolean/.test(typeof value)) {
        data[key] = value
      }
    }
    return data
  },

  mutation: (mutation) => {
    const { type } = mutation
    const data = { type }
    if (type == "characterData") {
      data.oldValue = mutation.oldValue
      data.newValue = mutation.target.nodeValue
    }
    if (type == "childList") {
      data.removedNodes = Array.from(mutation.removedNodes, (node) => node.cloneNode(true))
      data.addedNodes = Array.from(mutation.addedNodes, (node) => node.cloneNode(true))
    }
    return data
  }
}

const renderers = {
  event: (data) => {
    return `
      <td>${format(data.type)}</td>
      <td>${format(data.key)}</td>
      <td>${format(data.code)}</td>
      <td>${format(data.cancelable)}</td>
      <td>${format(data.isComposing)}</td>
      <td>${format(data.inputType)}</td>
      <td>${escape(format(data.data))}</td>
    `
  },

  mutation: (data) => {
    return `
      <td>${format(data.type)}</td>
      <td colspan="6">
        ${renderers[`${data.type}Mutation`](data)}
      </td>
    `
  },

  characterDataMutation: (data) => {
    return diffChars(data.oldValue, data.newValue).map(part => {
      const tagName = part.added ? "ins" : part.removed ? "del" : "span"
      return `<${tagName} class="diff diff--text">${escape(part.value)}</${tagName}>`
    }).join("")
  },

  childListMutation: (data) => {
    return data.addedNodes.map(node =>
      `<ins class="diff diff--node">${escape(format(node))}</ins>`
    ).concat(data.removedNodes.map(node =>
      `<del class="diff diff--node">${escape(format(node))}</del>`
    )).join("<br>")
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
