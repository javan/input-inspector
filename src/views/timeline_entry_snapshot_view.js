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

    for (const range of this.targetRanges) {
      const mark = document.createElement("mark")
      mark.classList.add("range", "range--target")
      mark.classList.toggle("range--collapsed", range.collapsed)
      mark.appendChild(range.extractContents())
      range.insertNode(mark)
    }

    return this.element.innerHTML
  }

  // Private

  get targetRanges() {
    const { targetRanges } = this.entry.data
    return targetRanges
      ? targetRanges.map(range => this.deserializeRange(range))
      : []
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
