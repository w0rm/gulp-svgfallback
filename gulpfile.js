var svgfallback = require('./index')
var gulp = require('gulp')

gulp.task('svgfallback', function () {
  return gulp
    .src('test/src/*.svg')
    .pipe(svgfallback())
    .pipe(gulp.dest('test/dest'))
})
