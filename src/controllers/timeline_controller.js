import { Controller } from "stimulus"
import { Profile } from "../models/profile"
import { Recorder } from "../models/recorder"
import { TimelineView } from "../views/timeline_view"

export default class extends Controller {
  static targets = [ "editor", "caption", "entries" ]

  initialize() {
    this.profile = Profile.create()
    this.recorder = new Recorder(this.profile.timeline, this.editorTarget)
    this.timelineView = new TimelineView(this.profile.timeline, this.entriesTarget)

    this.captionTarget.textContent = this.profile.browser.navigator.userAgent
    this.editorTarget.focus()
  }

  record(object) {
    this.recorder.record(object)
    this.timelineView.render()
  }

  async save() {
    await this.profile.save()
    window.location = `/p/${this.profile.id}`
  }
}
