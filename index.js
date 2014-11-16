var path = require('path')
var through2 = require('through2')
var gutil = require('gulp-util')
var _ = require('lodash')
var phridge = require('phridge')
var fs = require('fs')

module.exports = function (options) {

  options = options || {}

  var htmlTemplate = options.htmlTemplate || path.join(__dirname, 'template.html')
  var cssTemplate = options.cssTemplate || path.join(__dirname, 'template.css')
  var pngFileName = options.pngFileName || 'svgfallback.png'
  var cssFileName = options.cssFileName || 'svgfallback.css'
  var svgs = []

  return through2.obj(

    function transform (file, encoding, cb) {
      if (file.isStream()) {
        return cb(new gutil.PluginError('gulp-svgstore', 'Streams are not supported!'))
      }
      svgs.push(file.contents.toString('utf8'))
      cb()
    }

  , function flush (cb) {

      var self = this

      if (svgs.length === 0) return cb()

      renderTemplate(htmlTemplate, {svgs: svgs}, function (err, html) {
        if (err) {
          return cb(new gutil.PluginError('gulp-svgfallback', err))
        }
        phridge
          .spawn()
          .then(function (phantom) {
            return phantom
              .run(html, function (html, resolve) {
                var rects
                var rect
                var page = webpage.create()
                page.content = html
                rect = page.evaluate(function () {
                  return document.querySelector('.svgs').getBoundingClientRect()
                })
                rects = page.evaluate(function () {
                  var all = document.querySelectorAll('.svg')
                  return [].map.call(all, function (el) {
                    return el.getBoundingClientRect()
                  })
                })
                page.clipRect = rect
                resolve({
                  img: page.renderBase64('PNG')
                , rects: rects
                })
              })
              .finally(phridge.disposeAll)
          })
          .done(function (result) {
            var pngFile = new gutil.File({
              path: pngFileName
            , contents: new Buffer(result.img, 'base64')
            })
            self.push(pngFile)
            cb()
          }, function (err) {
            cb(new gutil.PluginError('gulp-svgfallback', err))
          })
      })
    }
  )
}


function renderTemplate (template, data, cb) {
  var template = fs.readFileSync(template, {encoding: 'utf8'})
  cb(null, _.template(template, data))
}
