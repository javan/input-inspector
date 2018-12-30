import { Timeline } from "./timeline"
import { AnimationFrame } from "./animation-frame"

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
    this.recordNextAnimationFrame()
    return this.timeline.record(object, this.snapshot, this.selection)
  }

  get snapshot() {
    return this.element.innerHTML
  }

  get selection() {
    const selection = window.getSelection()
    if (
      this.element.contains(selection.anchorNode) &&
      this.element.contains(selection.focusNode)
    ) {
      return selection
    }
  }

  // Private

  recordNextAnimationFrame() {
    if (this.animationFrame) return
    this.animationFrame = new AnimationFrame(() => {
      this.record(this.animationFrame)
      this.animationFrame = null
    })
  }

  recordMutations(mutations) {
    Array.from(mutations).forEach(mutation => this.record(mutation))
  }
}
