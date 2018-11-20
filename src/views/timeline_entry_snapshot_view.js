export class TimelineEntrySnapshotView {
  static render(...args) {
    return new this(...args).render()
  }

  constructor(entry) {
    this.entry = entry
  }

  render() {
    this.element = document.createElement("div")
    this.element.innerHTML = this.entry.snapshot

    const { targetRanges } = this
    for (const range of targetRanges) {
      const mark = document.createElement("mark")
      mark.classList.add("range", "range--target", `range--${range.collapsed ? "collapsed" : "expanded"}`)
      mark.appendChild(range.extractContents())
      range.insertNode(mark)
    }

    if (!targetRanges.length) {
      const { selectionRanges } = this
      for (const range of selectionRanges) {
        const mark = document.createElement("mark")
        mark.classList.add("range", "range--selection", `range--${range.collapsed ? "collapsed" : "expanded"}`)
        mark.appendChild(range.extractContents())
        range.insertNode(mark)
      }
    }

    return this.element.innerHTML
  }

  // Private

  get targetRanges() {
    const ranges = this.entry.data.targetRanges || []
    return ranges.map(range => this.deserializeRange(range))
  }

  get selectionRanges() {
    const ranges = this.entry.selection || []
    return ranges.map(range => this.deserializeRange(range))
  }

  deserializeRange({ startContainer, startOffset, endContainer, endOffset }) {
    let startContainerNode = this.element
    for (const index of startContainer) {
      startContainerNode = startContainerNode.childNodes.item(index)
    }
    let endContainerNode = this.element
    for (const index of endContainer) {
      endContainerNode = endContainerNode.childNodes.item(index)
    }
    const range = document.createRange()
    range.setStart(startContainerNode, startOffset)
    range.setEnd(endContainerNode, endOffset)
    return range
  }
}
