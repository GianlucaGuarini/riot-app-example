import Gateway from '../models/GatewayModel'

export default class extends Gateway {
  set slideId(id) {
    if (id == this._slideId) return
    this._slideId = +id // typecast to number
    this.trigger('slide::changed', this._slideId)
  }
  get slideId() {
    return this._slideId || 1
  }
}