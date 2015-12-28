import '../../../../shared/components/lib/tags'
import '../../../../shared/components/src/mixins'
import User from '../../../../shared/models/User'
import routes from '../../../../shared/routes'
import NProgress from 'nprogress'

var app,
  initialData = JSON.parse(window.initialData)

riot.route.base('/')
// start the progress bar
NProgress.start()

Object.keys(routes).forEach(function(route) {
  riot.route(route, function() {
    var gateway = routes[route]()
    if (!app) {
      initialData.gateway = gateway
      initialData.user = new User('Fake User')
      app = riot.mount('app', initialData)[0]
      NProgress.done()
    } else {
      NProgress.start()
      gateway.fetch()
        .then(function(data) {
          data.gateway = gateway
          app.mountSubview(data)
          NProgress.done()
        })
    }
  })
})

riot.route.start(true)



