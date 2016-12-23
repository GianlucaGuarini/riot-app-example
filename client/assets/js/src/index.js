import Velocity from 'velocity-animate'
import 'velocity-animate/velocity.ui'
import '../../../../shared/components/app.tag'
import '../../../../shared/components/mixins'
import { mount } from 'riot'
import route from 'riot-route'
import User from '../../../../shared/models/User'
import routes from '../../../../shared/routes'
import NProgress from 'nprogress'

var app,
  initialData = JSON.parse(window.initialData)

window.IS_SERVER = false
window.IS_CLIENT = true

route.base('/')
// start the progress bar
NProgress.start()

Object.keys(routes).forEach(function(path) {
  route(path, function(...args) {
    var gateway = routes[path](args)
    if (!app) {

      // extend the gateway using the initial data
      Object.assign(gateway, initialData.gateway)
      // store the initial data
      gateway._data = initialData

      initialData.gateway = gateway
      initialData.user = new User()
      app = mount('app', initialData)[0]
      NProgress.done()
    } else {
      if (!gateway.wasFetched) NProgress.start()

      gateway.fetch()
        .then(function(data) {
          data.gateway = gateway
          app.mountSubview(data)
          NProgress.done()
        })

    }
  })
})

route.start(true)



