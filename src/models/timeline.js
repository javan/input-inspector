export class Timeline {
  constructor() {
    this.entries = []
  }

  record(object) {
    const entry = {
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

  // Private

  serializeEvent(event) {
    const data = {}
    for (const key in event) {
      const value = event[key]
      if (/string|number|boolean/.test(typeof value)) {
        data[key] = value
      }
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
}
