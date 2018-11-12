import { Controller } from "stimulus"
import { Profile } from "../models/profile"
import { TimelineView } from "../views/timeline_view"

export default class extends Controller {
  static targets = [ "snapshot", "caption", "timeline" ]

  async initialize() {
    this.profile = await Profile.load(this.id)
    this.timelineView = new TimelineView(this.profile.timeline, this.timelineTarget)
    this.render()
  }

  render() {
    this.snapshotTarget.innerHTML = this.profile.timeline.slice(-1)[0].snapshot
    this.captionTarget.textContent = this.profile.browser.navigator.userAgent
    this.timelineView.render()
  }

  get id() {
    return window.location.search.match(/id=([^&]+)/)[1]
  }
}
