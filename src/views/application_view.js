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
    const match = location.toString().match(/(\/p\/|\?id=)([^\/]+)/)
    return match && match[2] ? match[2] : ""
  }
}
