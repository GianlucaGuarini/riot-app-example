import '../../../../shared/components/lib/tags'
import '../../../../shared/components/mixins'
import User from '../../../../shared/models/User'
import routes from '../../../../shared/routes'
import NProgress from 'nprogress'

var app,
  initialData = JSON.parse(window.initialData)

window.IS_SERVER = false
window.IS_CLIENT = true

riot.route.base('/')
// start the progress bar
NProgress.start()

Object.keys(routes).forEach(function(route) {
  riot.route(route, function() {
    var gateway = routes[route](...arguments)
    if (!app) {

      // extend the gateway using the initial data
      Object.assign(gateway, initialData.gateway)
      // store the initial data
      gateway._data = initialData

      initialData.gateway = gateway
      initialData.user = new User()
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



