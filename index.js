import express from 'express'
import { join } from 'path'
import { readdirSync, writeFile } from 'fs'
import riot from 'riot'
import sass from 'node-sass'
import routes from './app/routes'

const STATIC_FOLDER = join('app', 'assets')

const app = express()

var server,
  tagsPath = join(__dirname, 'app', 'components', 'src')

// static template engine
app.set('views', './app/views')
app.set('view engine', 'ejs')

// require all the tags
readdirSync(tagsPath).forEach(function(file) {
  require(join(tagsPath, file))
})

// auto compile the sass files on any request
app.use(/\.sass$/, function (req, res, next) {
  sass.render({
    file: join(STATIC_FOLDER, req.originalUrl),
    indentedSyntax: false,
    omitSourceMapUrl: true
  }, function(err, result) {
    if (!err) {
      res.setHeader('content-type', 'text/css')
      res.send(result.css.toString())
    }
    next()
  })
})

// set the routes
Object.keys(routes).forEach(function(route) {
  app.get(route, function(req, res) {
    res.render('base', {
      body: riot.render('app', {
        view: routes[route].view,
        data: routes[route].data
      })
    })
  })
})

// set the folder containing the static files
app.use(express.static(STATIC_FOLDER))

// start the server
server = app.listen(3000, function () {
  var host = server.address().address,
    port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})
