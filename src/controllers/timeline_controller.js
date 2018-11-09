import { Controller } from "stimulus"
import { Timeline } from "../models/timeline"
import { Session } from "../models/session"
import { Recorder } from "../models/recorder"
import { TimelineView } from "../views/timeline_view"

export default class extends Controller {
  static targets = [ "editor", "caption", "entries" ]

  initialize() {
    this.timeline = new Timeline
    this.session = new Session(this.timeline)
    this.recorder = new Recorder(this.timeline, this.editorTarget)
    this.timelineView = new TimelineView(this.timeline, this.entriesTarget)

    this.captionTarget.textContent = this.session.userAgent
    this.editorTarget.focus()
  }

  record(object) {
    this.recorder.record(object)
    this.timelineView.render()
  }
}
