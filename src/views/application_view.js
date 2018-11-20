export class ApplicationView {
  constructor(element) {
    this.element = element
    this.render()
  }

  render() {
    this.element.innerHTML = this.profileIds.map(id =>`
      <div data-controller="profile" data-profile-id="${id}" class="profile"></div>
    `).join("")
  }

  // Private

  get profileIds() {
    const { pathname, search } = window.location
    const match = pathname.match(/profiles\/([\w,]+)/) || search.match(/profileId=([\w,]+)/)
    const ids = match ? match[1] : ""
    return ids.split(",")
  }
}
