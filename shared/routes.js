import IndexGateway from './gateways/IndexGateway'

export default {
  '/': function() {
    return new IndexGateway({ url: '/api/index' })
  }
}