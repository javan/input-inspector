import { Timeline } from "./timeline"

export class Profile {
  static create() {
    return new this({
      id: secureRandom(),
      userAgent: navigator.userAgent,
      createdAt: new Date,
      timeline: new Timeline,
    })
  }

  constructor({ id, userAgent, createdAt, timeline }) {
    this.id = id
    this.userAgent = userAgent
    this.createdAt = createdAt
    this.timeline = timeline
  }
}

function secureRandom(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  const values = crypto.getRandomValues(new Uint8Array(length))
  const codes = values.map(value => chars.charCodeAt(value % chars.length))
  return String.fromCharCode(...codes)
}
