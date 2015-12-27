import { fetch } from '../helpers'
import riot from 'riot/riot'

export default class {
  constructor(opts) {
    riot.observable(this)
    this.isServer = typeof window === 'undefined'
    this.isClient = !this.isServer
    this.url = opts.url
  }
  fetch() {
    this.trigger('fetching')
    return fetch(this.url)
      .then((res) => {
        var data = JSON.parse(res)
        this.trigger('fetched', data)
        return data
      })
  }
}