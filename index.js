var path = require('path')
var through2 = require('through2')
var gutil = require('gulp-util')
var _ = require('lodash')
var phridge = require('phridge')
var fs = require('fs')
var when = require('when')

var SPRITE_TEMPLATE = path.join(__dirname, 'templates', 'sprite.html')

module.exports = function (options) {

  var opts = _.extend({
    cssTemplate: path.join(__dirname, 'templates', 'style.css')
  , pngFileName: 'svgfallback.png'
  , cssFileName: 'svgfallback.css'
  , backgroundUrl: 'svgfallback.png'
  , spriteWidth: 400
  , prefix: ''
  }, options)
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

      renderTemplate(SPRITE_TEMPLATE, {icons: svgs})
        .then(function (html) {
          return { html: html, spriteWidth: opts.spriteWidth }
        })
        .then(generateSprite)
        .then(function (sprite) {

          self.push(new gutil.File({
            path: opts.pngFileName
          , contents: new Buffer(sprite.img, 'base64')
          }))

          return renderTemplate(opts.cssTemplate, {
            backgroundUrl: opts.backgroundUrl
          , icons: sprite.icons
          , prefix: opts.prefix
          })

        })
        .done(
          function (css) {
            self.push(new gutil.File({
              path: opts.cssFileName
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


function generateSprite (opts) {
  return phridge.spawn()
    .then(function (phantom) {
      return phantom
        .run(opts, function (opts, resolve) {
          var icons
          var rect
          var page = webpage.create()  // jshint ignore: line
          page.viewportSize = { width: opts.spriteWidth, height: 1 }
          page.content = opts.html
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
