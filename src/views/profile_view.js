import { TimelineView } from "./timeline_view"

export class ProfileView {
  constructor(profile, element, template) {
    this.profile = profile
    this.element = element
    this.template = template
    this.element.innerHTML = this.html
    this.timelineView = new TimelineView(this.timeline, this.element.querySelector("tbody"))
    this.update()
  }

  update() {
    this.element.classList.toggle("has-timeline", this.timeline.length)
    this.timelineView.update()
  }

  // Private

  get timeline() {
    return this.profile.timeline
  }

  get browser() {
    return this.profile.browser
  }

  get snapshot() {
    const entry = this.timeline.slice(-1)[0]
    return entry ? entry.snapshot : ""
  }

  get html() {
    return `
      <div class="editor" contenteditable="true"
        data-placeholder="Type here…"
        data-target="profile.input"
        data-action="
          beforeinput->profile#record
          compositionstart->profile#record
          compositionupdate->profile#record
          compositionend->profile#record
          input->profile#record
          keydown->profile#record
        ">${this.snapshot || this.template}</div>

      <div class="profile-meta">
        <div class="profile-browser">
          <details>
            <summary class="profile-user-agent">${this.browser.navigator.userAgent}</summary>
            <pre class="profile-browser-data">${JSON.stringify(this.browser, null, 2)}</pre>
          </details>
        </div>

        <div class="profile-actions" ${this.profile.id ? "hidden" : ""}>
          <strong><button data-action="profile#save" title="Create a public URL for this page" data-disable-with="Saving…">Save</button></strong>
          or
          <button data-action="profile#toTemplate" title="Use the inspector’s contents as a template">Convert to template</button>
        </div>
      </div>

      <table>
        <colgroup>
          <col style="width: 3em">
          <col style="width: 10em">
          <col>
          <col>
          <col style="width: 1%">
          <col style="width: 1%">
          <col style="width: 1%">
          <col style="width: 1%">
        </colgroup>
        <thead>
          <tr>
            <th rowspan="5">#</th>
            <th rowspan="5">type</th>
          </tr>
          <tr>
            <th colspan="6">
              <abbr title="MutationRecord" class="row-type MutationRecord"></abbr>
              mutations
            </th>
          </tr>
          <tr>
            <th colspan="2">
              <abbr title="CompositionEvent" class="row-type CompositionEvent"></abbr>
              data
            </th>
          </tr>
          <tr>
            <th class="entry-col--type">
              <abbr title="InputEvent" class="row-type InputEvent"></abbr>
              data
            </th>
            <th>inputType</th>
          </tr>
          <tr>
            <th>
              <abbr title="KeyboardEvent" class="row-type KeyboardEvent"></abbr>
              key
            </th>
            <th>code</th>
            <th rowspan="3"><abbr title="Event: key modifiers" class="symbol">⌨️</abbr></th>
            <th rowspan="3"><abbr title="Event: repeat" class="symbol">🔂</abbr></th>
            <th rowspan="3"><abbr title="Event: isComposing" class="symbol">✍️</abbr></th>
            <th rowspan="3"><abbr title="Event: cancelable" class="symbol">🚫</abbr></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `
  }
}
