import { Controller } from "stimulus"
import { Profile } from "../models/profile"
import { Recorder } from "../models/recorder"
import { ProfileView } from "../views/profile_view"

export default class extends Controller {
  static targets = [ "input" ]

  async initialize() {
    this.profile = await findOrCreateProfile(this.data.get("id"))
    this.view = new ProfileView(this.profile, this.element)
    this.recorder = new Recorder(this.profile.timeline, this.inputTarget)
  }

  record(object) {
    this.recorder.record(object)
    this.view.update()
  }

  async save() {
    await this.profile.save()
    this.navigateTo(`/profiles/${this.profile.id}`)
  }

  // Private

  navigateTo(path) {
    history.pushState(null, null, path)
    const event = document.createEvent("Events")
    event.initEvent("navigate", true, false)
    event.state = history.state
    this.element.dispatchEvent(event)
  }
}

async function findOrCreateProfile(id) {
  return id ? Profile.load(id) : Profile.create()
}
