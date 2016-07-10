import '../../../../shared/components/mixins'
// import the layout components
import '../../../../shared/components/src/layout/sidebar.tag'
import '../../../../shared/components/src/layout/user-status.tag'
// import all the pages
import '../../../../shared/components/src/pages/index.tag'
import '../../../../shared/components/src/pages/gallery.tag'
import '../../../../shared/components/src/pages/login.tag'
import '../../../../shared/components/src/pages/feed.tag'
import '../../../../shared/components/src/app.tag'

import riot from 'riot/riot'
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
  riot.route(route, function(...args) {
    var gateway = routes[route](args)
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

riot.route.start(true)



