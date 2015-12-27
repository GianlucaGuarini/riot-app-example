import '../../../../shared/components/lib/tags'
import routes from '../../../../shared/routes'
import globalEvents from './globalEvents'
import NProgress from 'nprogress'

var app,
  initialData = JSON.parse(window.initialData)

riot.route.base('/')
// start the progress bar
NProgress.start()

Object.keys(routes).forEach(function(route) {

  riot.route(route, function() {
    if (!app) {
      initialData.globalEvents = globalEvents
      initialData.gateway = routes[route]()
      app = riot.mount('app', initialData)[0]
      NProgress.done()
    } else {
      var gateway = routes[route]()
      NProgress.start()
      gateway.fetch().then(function(data) {
        data.globalEvents = globalEvents
        data.gateway = gateway
        app.mountSubview(data)
        NProgress.done()
      })
    }
  })
})

riot.route.start(true)



