/* global describe, it, beforeEach, afterEach */

var svgfallback = require('./index')
var assert = require('assert')
var gutil = require('gulp-util')
var imageSize = require('image-size')
var _ = require('lodash')
var sinon = require('sinon')

var CIRCLE = '<svg width="40" height="40" viewBox="0 0 40 40">' +
             '<circle cx="20" cy="20" r="10"/></svg>'
var SQUARE = '<svg width="40" height="40" viewBox="0 0 40 40">' +
             '<rect x="10" y="10" width="20" height="20"/></svg>'

describe('gulp-svgfallback', function () {

  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })


  it('should output two files, png and css, named with base path of the first file', function (done) {

    var stream = svgfallback()
    var files = []

    stream.on('data', files.push.bind(files))

    stream.write(new gutil.File({
      contents: new Buffer(CIRCLE)
    , path: 'src/icons/circle.svg'
    , base: 'src/icons'
    }))
    stream.write(new gutil.File({
      contents: new Buffer(SQUARE)
    , path: 'src2/icons2/square.svg'
    , base: 'src2/icons2'
    }))

    stream.on('end', function () {
      assert.ok(files.length === 2)
      assert.ok(files[0].path === 'icons.png')
      assert.ok(files[1].path === 'icons.css')
      done()
    })

    stream.end()

  })


  it('should name result files svgfallback by default if base path of the first file is missing', function (done) {

    var stream = svgfallback()
    var files = []

    stream.on('data', files.push.bind(files))

    stream.write(new gutil.File({
      contents: new Buffer(CIRCLE)
    , path: 'circle.svg'
    , base: '.'
    }))
    stream.write(new gutil.File({
      contents: new Buffer(SQUARE)
    , path: 'square.svg'
    , base: '.'
    }))

    stream.on('end', function () {
      assert.ok(files.length === 2)
      assert.ok(files[0].path === 'svgfallback.png')
      assert.ok(files[1].path === 'svgfallback.css')
      done()
    })

    stream.end()

  })


  it('should emit error if files have the same name', function (done) {

      var stream = svgfallback()

      stream.on('error', function (error) {
        assert.ok(error instanceof gutil.PluginError);
        assert.equal(error.message, 'File name should be unique: circle')
        done()
      })

      stream.write(new gutil.File({ contents: new Buffer('<svg></svg>'), path: 'circle.svg' }))
      stream.write(new gutil.File({ contents: new Buffer('<svg></svg>'), path: 'circle.svg' }))

      stream.end()

  })


  it('should not output anything if the stream was empty', function (done) {

    var stream = svgfallback()
    var isEmpty = true

    stream.on('data', function () {
      isEmpty = false
    })

    stream.on('end', function () {
      assert.ok(isEmpty)
      done()
    })

    stream.end()

  })


  it('should correctly pass missing css template error', function (done) {

    var stream = svgfallback({ cssTemplate: 'missing-temaplate.css' })

    stream.write(new gutil.File({ contents: new Buffer(CIRCLE), path: 'circle.svg' }))

    stream.on('error', function (err) {
      assert.ok(err instanceof gutil.PluginError)
      assert.equal(err.plugin, 'gulp-svgfallback')
      done()
    })

    stream.end()

  })


  it('should correctly pass syntax error in css template', function (done) {

    var stream = svgfallback({ cssTemplate: 'test/src/syntax-error.css' })

    stream.write(new gutil.File({ contents: new Buffer(CIRCLE), path: 'circle.svg' }))

    stream.on('error', function (err) {
      assert.ok(err instanceof gutil.PluginError)
      assert.equal(err.plugin, 'gulp-svgfallback')
      done()
    })

    stream.end()

  })


  it('should not output image wider than specified in spriteWidth option', function (done) {

    var spriteWidth = 40
    var stream = svgfallback({ spriteWidth: spriteWidth })
    var files = []

    for(var i = 0; i < 10; i++) {
      // Each svg is 40px size
      stream.write(new gutil.File({
        contents: new Buffer(CIRCLE)
      , path: 'file' + i + '.svg'
      , base: '.'
      }))
    }

    stream.on('data', files.push.bind(files))

    stream.on('end', function () {
      // The first file is generated png
      assert.ok(files[0].path === 'svgfallback.png')
      assert.ok(imageSize(files[0].contents).width <= spriteWidth)
      done()
    })

    stream.end()

  })


  it('should pass correct data into templating functions', function (done) {

    var spy = sandbox.spy(_, 'template')
    var stream = svgfallback()

    stream.on('data', function () {})

    stream.write(new gutil.File({ contents: new Buffer(CIRCLE), path: 'circle.svg', base: '.' }))
    stream.write(new gutil.File({ contents: new Buffer(SQUARE), path: 'square.svg', base: '.' }))

    stream.on('end', function () {

      // _.template should be called twice
      assert.ok(spy.calledTwice)

      // first call for sprite template
      assert.deepEqual(spy.getCall(0).args[1], {
        icons: {circle: CIRCLE, square: SQUARE }
      })

      // second call for css template
      assert.deepEqual(spy.getCall(1).args[1], {
        backgroundUrl: 'svgfallback.png'
      , icons: [
          { name: 'circle', width: 40, height: 40, left: 0, top: 0 }
        , { name: 'square', width: 40, height: 40, left: 40, top: 0 }
        ]
      })

      done()
    })

    stream.end()

  })

})
