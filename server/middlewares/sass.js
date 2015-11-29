import sass from 'node-sass'
import { join } from 'path'

// auto compile the sass files on any request
export default function(STATIC_FOLDER) {
  return function (req, res, next) {
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
  }
}