gulp-svgfallback [![Build Status](https://api.travis-ci.org/w0rm/gulp-svgfallback.png)](https://travis-ci.org/w0rm/gulp-svgfallback)
================

Generate png sprite from svg sources.

1. Runs phantomjs *only once* for all svg sources
2. Doesn't create any temporary files
3. Allows to use custom CSS template

## Options

* backgroundUrl — url of background image, is set to output png fileName by default;
* cssTemplate — path to custom CSS lodash template;
* spriteWidth — maximum width of the sprite, `default: 400`.

**Automatic options**:

* css class of each icon is set to the name of corresponding file;
* output png and css filenames are set to the name of base directory of the first file.

If your workflow is different, please use `gulp-rename` to rename sources or result files.

## Usage

The following task will output icons.png and icons.css:

```js
var svgfallback = require('gulp-svgfallback');
var gulp = require('gulp');

gulp.task('svgfallback', function () {
    return gulp
        .src('src/icons/*.svg', {base: 'src/icons'})
        .pipe(svgfallback())
        .pipe(gulp.dest('dest'));
});
```

## Custom css template

An additional option `cssTemplate` allows you to override template that is used to generate css.
For more info, please check the default template in 'templates/style.css'.

Here is an example of data that is passed to css template:

```json
{
    "backgroundUrl": "sprite.png",
    "icons": [
        {
            "name": "circle",
            "width": 40,
            "height": 40,
            "left": 0,
            "top": 0
        },
        {
            "name": "square",
            "width": 40,
            "height": 40,
            "left": 40,
            "top": 0
        }
    ]
}
```

## Custom css classes

If you need to add prefix to each css class, please use `gulp-rename`:

```js
var gulp = require('gulp');
var rename = require('gulp-rename');
var svgfallback = require('gulp-svgfallback');

gulp.task('default', function () {
    return gulp
        .src('src/icons/*.svg', {base: 'src/icons'})
        .pipe(rename({prefix: 'icon-'})
        .pipe(svgfallback())
        .pipe(gulp.dest('dest'));
});
```

Since css class for each icon should be unique, you cannot pass files with the same name.
If you need to have nested directories that may have files with the same name, please
use `gulp-rename`. The following example will concatenate relative path with the name of the file,
e.g. `src/icons/one/two/three/circle.svg` becomes `one-two-three-circle`.

```js
var gulp = require('gulp');
var rename = require('gulp-rename');
var svgfallback = require('gulp-svgfallback');

gulp.task('default', function () {
    return gulp
        .src('src/icons/**/*.svg', {base: 'src/icons'})
        .pipe(rename(function (path) {
            var name = path.dirname.split(path.sep);
            name.push(path.basename);
            path.basename = name.join('-');
        }))
        .pipe(svgfallback())
        .pipe(gulp.dest('dest'));
});
```

## Add variations

To add variations (e.g. different colors) into your sprite,
you can combine gulp-svgfallback with other gulp plugins.

The following task will add `.circle-red` and `.circle-blue` into your sprite.

```js
var path = require('path');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');
var clone = require('gulp-clone');
var cheerio = require('gulp-cheerio');
var rename = require('gulp-rename');
var svgfallback = require('gulp-svgfallback');

function isCircle (file) {
    return path.basename(file.relative) === 'circle.svg';
}

function colorize (color) {
    var sink;
    return (lazypipe()
        .pipe(function () {
            sink = clone.sink();
            return sink;
        })
        .pipe(cheerio, function ($) {
            $('svg').attr('fill', color);
        })
        .pipe(rename, {suffix: '-' + color})
        .pipe(function () {
            return sink.tap();
        })
    )();
}

gulp.task('svgfallback', function () {
    return gulp
        .src('src/icons/*.svg', {base: 'src/icons'})
        .pipe(gulpif(isCircle, colorize('red')))
        .pipe(gulpif(isCircle, colorize('blue')))
        .pipe(svgfallback())
        .pipe(gulp.dest('dest'));
});
```

## Changelog

* 3.0.1 Reduced dev dependencies
* 2.0.0 Reduced amount of options, improved readme
* 1.0.1 Added example of how to add variations
* 1.0.0 Initial release
