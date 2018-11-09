import { Controller } from "stimulus"
import { Recorder } from "../models/recorder"
import { TimelineView } from "../views/timeline_view"

export default class extends Controller {
  static targets = [ "editor", "entries" ]

  initialize() {
    this.recorder = new Recorder(this.editorTarget)
    this.timelineView = new TimelineView(this.recorder.timeline, this.entriesTarget)
    this.editorTarget.focus()
  }

  record(object) {
    this.recorder.record(object)
    this.timelineView.render()
  }
}
