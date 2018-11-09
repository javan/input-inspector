import { Timeline } from "./timeline"

export class Recorder {
  constructor(element) {
    this.element = element
    this.timeline = new Timeline
    this.observer = new MutationObserver(this.recordMutations.bind(this))
    this.start()
  }

  start() {
    this.observer.observe(this.element, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    })
  }

  stop() {
    this.observer.disconnect()
  }

  record(object) {
    return this.timeline.record(object, this.snapshot)
  }

  get snapshot() {
    return `<div class="${this.element.className}">${this.element.innerHTML}</div>`
  }

  get userAgent() {
    return navigator.userAgent
  }

  // Private

  recordMutations(mutations) {
    Array.from(mutations).forEach(mutation => this.record(mutation))
  }
}
