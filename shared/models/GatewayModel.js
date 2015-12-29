import { fetch } from '../helpers'
import riot from 'riot/riot'

// cached data
export default class {
  constructor(opts) {
    riot.observable(this)
    this.url = opts.url
    this._data = null
  }
  // fetch new data from the api caching the result
  fetch() {
    // was it already fetched
    if (!this._data) {
      this.trigger('fetching')
      return fetch(this.url)
        .then((res) => {
          var data = JSON.parse(res)
          this._data = Object.assign({}, data) // clone the original data
          this.wasFetched = true
          this.trigger('fetched', data)
          return data
        })
    } else
      return Promise.resolve(this._data)
  }
}