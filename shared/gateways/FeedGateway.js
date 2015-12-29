import Gateway from '../models/GatewayModel'
import { getBase } from '../helpers'

export default class extends Gateway {
  listen() {
    // no need to run this on the server
    if (IS_SERVER) return
    this.socket = io.connect(getBase(), { forceNew: true })
    this.socket.on('news', (news) => {
      this.trigger('news::published', news)
    })
  }
}