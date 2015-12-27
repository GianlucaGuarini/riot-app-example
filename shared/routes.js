import IndexGateway from './gateways/IndexGateway'
import FeedGateway from './gateways/FeedGateway'

export default {
  '/': function() {
    return new IndexGateway({ url: '/api/index' })
  },
  '/feed': function() {
    return new FeedGateway({ url: '/api/feed' })
  }
}