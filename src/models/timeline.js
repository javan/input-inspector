export class Timeline {
  constructor(entries = []) {
    this.entries = entries
  }

  record(object, snapshot, selection) {
    const entry = {
      snapshot,
      selection: serializeSelection(selection),
      time: performance.now(),
      constructorName: object.constructor.name
    }
    if (object instanceof Event) {
      return this.entries.push({
        type: "event",
        data: this.serializeEvent(object),
        ...entry
      })
    }
    if (object instanceof MutationRecord) {
      return this.entries.push({
        type: "mutation",
        data: this.serializeMutation(object),
        ...entry
      })
    }
  }

  slice(...args) {
    return this.entries.slice(...args)
  }

  toJSON() {
    return this.entries
  }

  get length() {
    return this.entries.length
  }

  // Private

  serializeEvent(event) {
    const data = {}
    for (const key in event) {
      const value = event[key]
      if (/string|number|boolean/.test(typeof value)) {
        data[key] = value
      }
    }
    if (event.dataTransfer) {
      data.dataTransfer = this.serializeDataTransfer(event.dataTransfer)
    }
    if (typeof event.getTargetRanges == "function") {
      data.targetRanges = Array.from(event.getTargetRanges(), serializeRange)
    }
    return data
  }

  serializeMutation(mutation) {
    const { type } = mutation
    const data = { type }
    if (type == "characterData") {
      data.oldValue = mutation.oldValue
      data.newValue = mutation.target.nodeValue
    }
    if (type == "childList") {
      data.removedNodes = Array.from(mutation.removedNodes, this.serializeNode)
      data.addedNodes = Array.from(mutation.addedNodes, this.serializeNode)
    }
    return data
  }

  serializeNode(node) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return { type: "text", value: node.data }
      case Node.ELEMENT_NODE:
        return { type: "element", value: node.outerHTML }
      case Node.COMMENT_NODE:
        return { type: "comment", value: node.data }
    }
  }

  serializeDataTransfer(dataTransfer) {
    const data = {}
    if (dataTransfer.types) {
      data.types = {}
      for (const type of dataTransfer.types) {
        const value = dataTransfer.getData(type)
        if (typeof value == "string") {
          data.types[type] = value
        }
      }
    }
    if (dataTransfer.files) {
      data.files = Array.from(dataTransfer.files, this.serializeFile)
    }
    return data
  }

  serializeFile(file) {
    const { name, type, size } = file
    return { name, type, size }
  }
}

function serializeSelection(selection) {
  const ranges = []
  if (selection) {
    while (ranges.length < selection.rangeCount) {
      const range = selection.getRangeAt(ranges.length)
      ranges.push(serializeRange(range))
    }
  }
  return ranges
}

function serializeRange(range) {
  return {
    contents: serializeRangeContents(copyRange(range)),
    startContainer: serializeRangeContainer(range.startContainer),
    endContainer: serializeRangeContainer(range.endContainer),
    startOffset: range.startOffset,
    endOffset: range.endOffset,
  }
}

function serializeRangeContainer(node) {
  const indexes = []
  while (node && node.parentNode && node.parentNode.isContentEditable) {
    const { parentNode } = node
    const index = Array.from(parentNode.childNodes).indexOf(node)
    indexes.unshift(index)
    node = parentNode
  }
  return indexes
}

function serializeRangeContents(range) {
  const element = document.createElement("div")
  element.appendChild(range.cloneContents())
  return element.innerHTML
}

function copyRange(range) {
  const copy = document.createRange()
  copy.setStart(range.startContainer, range.startOffset)
  copy.setEnd(range.endContainer, range.endOffset)
  return copy
}
