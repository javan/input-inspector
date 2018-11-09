export class Session {
  constructor(timeline) {
    this.id = secureRandom()
    this.userAgent = navigator.userAgent
    this.createdAt = new Date
    this.timeline = timeline
  }
}

function secureRandom(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  const values = crypto.getRandomValues(new Uint8Array(length))
  const codes = values.map(value => chars.charCodeAt(value % chars.length))
  return String.fromCharCode(...codes)
}
