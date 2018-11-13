import { Controller } from "stimulus"
import { ApplicationView } from "../views/application_view"

export default class extends Controller {
  initialize() {
    this.view = new ApplicationView(this.element)
  }

  render() {
    this.view.render()
  }
}
