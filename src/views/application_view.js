export class ApplicationView {
  constructor(element) {
    this.element = element
    this.render()
  }

  render() {
    this.element.innerHTML = `
      <div data-controller="profile" data-profile-id="${this.profileId}"></div>
    `
  }

  // Private

  get profileId() {
    const { pathname, search } = window.location
    const match = pathname.match(/profiles\/(\w+)/) || search.match(/profileId=(\w+)/)
    return match ? match[1] : ""
  }
}
