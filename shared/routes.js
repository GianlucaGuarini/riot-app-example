import IndexGateway from './gateways/IndexGateway'
import FeedGateway from './gateways/FeedGateway'
import LoginGateway from './gateways/LoginGateway'
import GalleryGateway from './gateways/GalleryGateway'

// cache the gateways instances
var gateways = {},
  // cache the gateways avoiding to fetch the same data twice
  getGateway = function(name, Gateway, opts) {
    if (gateways[name] && IS_CLIENT)
      return gateways[name]
    else {
      // cache the gateway
      gateways[name] = new Gateway(opts)
      return gateways[name]
    }
  }

export default {
  '/': function() {
    return getGateway('index', IndexGateway, { url: '/api/index' })
  },
  '/feed': function() {
    return getGateway('feed', FeedGateway, { url: '/api/feed' })
  },
  '/login': function() {
    return getGateway('login', LoginGateway, { url: '/api/login' })
  },
  '/gallery': function() {
    return getGateway('gallery', GalleryGateway, { url: '/api/gallery' })
  },
  '/gallery/*': function(id) {
    var galleryGateway = getGateway('gallery', GalleryGateway, { url: '/api/gallery' })
    galleryGateway.slideId = id // set the slide id
    return galleryGateway
  }
}