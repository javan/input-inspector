export class ApplicationView {
  constructor(element) {
    this.element = element
    this.render()
  }

  render() {
    const { profileIds, template } = this
    this.element.innerHTML = profileIds.map(id =>`
      <div class="profile"
        data-controller="profile"
        data-profile-id-value="${id}"
        data-profile-template-value="${template}"></div>
    `).join("")
  }

  // Private

  get profileIds() {
    const match = location.pathname.match(/profiles\/([\w,]+)/)
    const ids = match ? match[1] : ""
    return ids.split(",")
  }

  get template() {
    const match = location.pathname.match(/template\/([^\/]+)/)
    return match ? match[1] : ""
  }
}
