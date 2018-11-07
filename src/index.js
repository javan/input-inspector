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
      data.removedNodes = Array.from(mutation.removedNodes, serializers.node)
      data.addedNodes = Array.from(mutation.addedNodes, serializers.node)
    }
    return data
  },

  node: (node) => {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return { type: "text", value: node.data }
      case Node.ELEMENT_NODE:
        return { type: "element", value: node.outerHTML }
      case Node.COMMENT_NODE:
        return { type: "comment", value: node.data }
    }
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
      <td>${format(data.data)}</td>
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
      `<del class="diff diff--node"><span class="node node--${type}">${format(value)}</span</del>`
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
