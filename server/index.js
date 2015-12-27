import express from 'express'
import { join } from 'path'
import glob from 'glob'
import sassMiddleware from './middlewares/sass'
import riot from 'riot'
import routes from '../shared/routes'
import apiRouter from './api-router'
import FeedWebsockets from './feed-websockets'
import { HOST_NAME, PORT, STATIC_FOLDER, TAGS_FOLDER, VIEWS_FOLDER, VIEWS_ENGINE } from '../shared/config'

const app = express(),
  BASE = __dirname

var server, feedWebsockets

// static template engine
app.set('views', join(BASE, VIEWS_FOLDER))
app.set('view engine', VIEWS_ENGINE)

// require all the tags
glob(join(BASE, TAGS_FOLDER, '**', '*.tag'), function(err, tags) {
  tags.forEach(function(tag) {
    require(tag)
  })
})

// auto compile the sass files on any request
app.use(/\.sass$/, sassMiddleware(join(BASE, STATIC_FOLDER)))

// set the app routes receiving the view to render and its data
Object.keys(routes).forEach(function(route) {
  app.get(route, function(req, res) {
    var gateway = routes[route]()
    gateway
      .fetch()
      .then(function(data) {
        data.gateway = gateway
        res.render('base', {
          initialData: JSON.stringify(data),
          body: riot.render('app', data)
        })
      })
  })
})

// set the api router
app.use('/api', apiRouter)

// set the folder containing the static files
app.use(express.static(join(BASE, STATIC_FOLDER)))

// start the server
server = app.listen(PORT, HOST_NAME, function () {
  console.log('Example app listening at http://%s:%s', HOST_NAME, PORT)
})

// add some fancy websockets to this server
feedWebsockets = new FeedWebsockets(server)


