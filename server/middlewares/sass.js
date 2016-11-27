import sass from 'node-sass'
import { join } from 'path'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'

var prefixer = postcss([autoprefixer])

// auto compile the sass files on any request
export default function(STATIC_FOLDER) {
  return function (req, res, next) {
    sass.render({
      file: join(STATIC_FOLDER, req.originalUrl),
      indentedSyntax: false,
      omitSourceMapUrl: true
    }, function(err, result) {
      if (!err)
        prefixer
          .process(result.css.toString())
          .then(function (prefixed) {
            res.setHeader('content-type', 'text/css')
            res.send(prefixed.css)
            next()
          })
      else
        throw new Error(err)
    })
  }
}