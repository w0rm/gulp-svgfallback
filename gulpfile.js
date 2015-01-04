var svgfallback = require('./index')
var gulp = require('gulp')
var mocha = require('gulp-mocha')

gulp.task('svgfallback', function () {
  return gulp
    .src('test/src/*.svg')
    .pipe(svgfallback())
    .pipe(gulp.dest('test/dest'))
})

gulp.task('test', function () {
  return gulp
    .src('test.js', { read: false })
    .pipe(mocha({ timeout: 3000 }))
})
