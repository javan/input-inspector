export class AnimationFrame {
  static get name() {
    return "AnimationFrame"
  }

  constructor(callback) {
    this.id = requestAnimationFrame(callback)
  }
}
