import { Controller } from "stimulus"
import { Timeline } from "../models/timeline"
import { TimelineView } from "../views/timeline_view"

export default class extends Controller {
  static targets = [ "editor", "entries" ]

  initialize() {
    this.timeline = new Timeline
    this.timelineView = new TimelineView(this.timeline, this.entriesTarget)
    this.startObserver()
    this.editorTarget.focus()
  }

  record(object) {
    this.timeline.record(object)
    this.timelineView.render()
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
}
