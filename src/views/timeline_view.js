import { TimelineEntryView } from "./timeline_entry_view"

export class TimelineView {
  constructor(timeline, element) {
    this.timeline = timeline
    this.element = element
    this.rendering = false
    this.renderIndex = 0
    this.update()
  }

  update() {
    if (this.rendering) return
    this.rendering = true

    requestAnimationFrame(() => {
      const entries = this.timeline.slice(this.renderIndex)
      entries.forEach((entry, index) => {
        const html = TimelineEntryView.render(entry, index + this.renderIndex + 1)
        this.element.insertAdjacentHTML("afterbegin", html)
      })
      this.rendering = false
      this.renderIndex += entries.length
    })
  }
}
