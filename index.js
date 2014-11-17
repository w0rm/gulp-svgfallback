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
  var prefix = options.prefix || ''
  var svgs = []

  return through2.obj(

    function transform (file, encoding, cb) {
      if (file.isStream()) {
        return cb(new gutil.PluginError('gulp-svgstore', 'Streams are not supported!'))
      }
      svgs.push({
        content: file.contents.toString('utf8')
      , name: path.basename(file.relative, path.extname(file.relative))
      })
      cb()
    }

  , function flush (cb) {

      var self = this

      if (svgs.length === 0) return cb()

      renderTemplate(htmlTemplate, {icons: svgs}, function (err, html) {
        if (err) {
          return cb(new gutil.PluginError('gulp-svgfallback', err))
        }
        phridge
          .spawn()
          .then(function (phantom) {
            return phantom
              .run(html, function (html, resolve) {
                var icons
                var rect
                var page = webpage.create()
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
                resolve({
                  img: page.renderBase64('PNG')
                , icons: icons
                })
              })
              .finally(phantom.dispose.bind(phantom))
          })
          .done(function (result) {
            var pngFile = new gutil.File({
              path: pngFileName
            , contents: new Buffer(result.img, 'base64')
            })
            self.push(pngFile)
            renderTemplate(cssTemplate, {icons: result.icons, prefix: prefix}, function (err, css) {
              if (err) {
                return cb(new gutil.PluginError('gulp-svgfallback', err))
              }
              var cssFile = new gutil.File({
                path: cssFileName
              , contents: new Buffer(css)
              })
              self.push(cssFile)
              cb()
            })
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
