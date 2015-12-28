import IndexGateway from './gateways/IndexGateway'
import FeedGateway from './gateways/FeedGateway'
import LoginGateway from './gateways/LoginGateway'

export default {
  '/': function() {
    return new IndexGateway({ url: '/api/index' })
  },
  '/feed': function() {
    return new FeedGateway({ url: '/api/feed' })
  },
  '/login': function() {
    return new LoginGateway({ url: '/api/login' })
  }
}