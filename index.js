var path = require('path')
var through2 = require('through2')
var gutil = require('gulp-util')
var _ = require('lodash')
var phridge = require('phridge')
var fs = require('fs')
var when = require('when')


module.exports = function (options) {

  options = options || {}

  var spriteTemplate = options.spriteTemplate || path.join(__dirname, 'templates', 'sprite.html')
  var cssTemplate = options.cssTemplate || path.join(__dirname, 'templates', 'style.css')
  var pngFileName = options.pngFileName || 'svgfallback.png'
  var cssFileName = options.cssFileName || 'svgfallback.css'
  var backgroundUrl = options.backgroundUrl || pngFileName
  var prefix = options.prefix || ''
  var svgs = []

  return through2.obj(

    function transform (file, encoding, cb) {
      if (file.isStream()) {
        return cb(new gutil.PluginError('gulp-svgstore', 'Streams are not supported!'))
      }
      svgs.push({
        content: file.contents.toString()
      , name: path.basename(file.relative, path.extname(file.relative))
      })
      cb()
    }

  , function flush (cb) {

      var self = this

      if (svgs.length === 0) return cb()

      renderTemplate(spriteTemplate, {icons: svgs})
        .then(generateSprite)
        .then(function (sprite) {

          self.push(new gutil.File({
            path: pngFileName
          , contents: new Buffer(sprite.img, 'base64')
          }))

          return renderTemplate(cssTemplate, {
            backgroundUrl: backgroundUrl
          , icons: sprite.icons
          , prefix: prefix
          })

        })
        .done(
          function (css) {
            self.push(new gutil.File({
              path: cssFileName
            , contents: new Buffer(css)
            }))
            cb()
          }
        , function (err) {
            cb(new gutil.PluginError('gulp-svgstore', err))
          }
        )
    }
  )
}


function renderTemplate (fileName, options) {
  return when.promise(function (resolve, reject) {
    fs.readFile(fileName, function (err, template) {
      if (err) return reject(err)
      try {
        resolve(_.template(template, options))
      } catch (err) {
        reject(err)
      }
    })
  })
}


function generateSprite (html) {
  return phridge.spawn()
    .then(function (phantom) {
      return phantom
        .run(html, function (html, resolve) {
          var icons
          var rect
          var page = webpage.create()  // jshint ignore: line
          page.content = html
          rect = page.evaluate(function () {
            return document.querySelector('.icons').getBoundingClientRect()
          })
          icons = page.evaluate(function () {
            var all = document.querySelectorAll('.icon')
            return [].map.call(all, function (el) {
              var result = el.getBoundingClientRect()
              result.name = el.getAttribute('data-name')
              return result
            })
          })
          page.clipRect = rect
          resolve({ img: page.renderBase64('PNG'), icons: icons })
        })
        .finally(phantom.dispose.bind(phantom))
    })
}
