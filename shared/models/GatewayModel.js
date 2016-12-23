import { fetch } from '../helpers'
import { observable } from 'riot'

// cached data
export default class {
  constructor(opts) {
    observable(this)
    this.url = opts.url
    this.wasFetched = false
    this._data = null
  }
  // fetch new data from the api caching the result
  fetch() {
    // was it already fetched
    if (!this.wasFetched) {
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