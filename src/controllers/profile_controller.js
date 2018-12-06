import { Controller } from "stimulus"
import { Profile } from "../models/profile"
import { Recorder } from "../models/recorder"
import { ProfileView } from "../views/profile_view"

export default class extends Controller {
  static targets = [ "input" ]

  async initialize() {
    this.profile = await findOrCreateProfile(this.id)
    this.view = new ProfileView(this.profile, this.element, this.template)
    this.recorder = new Recorder(this.timeline, this.inputTarget)
  }

  get id() {
    return this.data.get("id")
  }

  get template() {
    return decodeURIComponent(this.data.get("template"))
  }

  get timeline() {
    return this.profile.timeline
  }

  record(object) {
    this.recorder.record(object)
    this.view.update()
  }

  async save(event) {
    disable(event.target)
    await this.profile.save()
    this.navigateTo(`/profiles/${this.profile.id}`)
  }

  toTemplate(event) {
    const template = encodeURIComponent(this.inputTarget.innerHTML)
    this.navigateTo(`/template/${template}`)
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

function disable(element) {
  element.disabled = true
  const text = element.getAttribute("data-disable-with")
  if (text) element.textContent = text
}
