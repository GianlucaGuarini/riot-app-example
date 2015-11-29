import '../../../../shared/components/lib/tags'
import { getBase } from '../../../../shared/helpers'
import routes from '../../../../shared/routes'
import globalEvents from './globalEvents'

var app,
  initialData = JSON.parse(window.initialData)

riot.route.base(getBase())

Object.keys(routes).forEach(function(route) {
  riot.route(route, function() {
    if (!app) {
      initialData.globalEvents = globalEvents
      initialData.gateway = routes[route]()
      app = riot.mount('app', initialData)[0]
    } else {
      var gateway = routes[route]()
      gateway.fetch().then(function(data) {
        data.globalEvents = globalEvents
        data.gateway = gateway
        app.mountSubview(data)
      })
    }
  })
})

riot.route.start(true)



