import { Controller } from "stimulus"
import { Timeline } from "../models/timeline"
import { TimelineEntryView } from "../views/timeline_entry_view"

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
        const html = TimelineEntryView.render(entry, index + this.renderIndex + 1)
        entriesTarget.insertAdjacentHTML("afterbegin", html)
      })
      this.rendering = false
      this.renderIndex += entries.length
    })
  }
}
