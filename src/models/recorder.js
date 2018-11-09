import { Timeline } from "./timeline"

export class Recorder {
  constructor(timeline, element) {
    this.timeline = timeline
    this.element = element
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
    return this.element.innerHTML
  }

  // Private

  recordMutations(mutations) {
    Array.from(mutations).forEach(mutation => this.record(mutation))
  }
}
