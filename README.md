gulp-svgfallback [![Build Status](https://api.travis-ci.org/w0rm/gulp-svgfallback.png)](https://travis-ci.org/w0rm/gulp-svgfallback)
================

Generate png sprite from svg sources.

1. Runs phantomjs *only once* for all svg sources
2. Doesn't create any temporary files
3. Allows to use custom CSS template

## Options

* pngFileName — name of output png file, default: 'svgfallback.png'
* cssFileName — name of output css file, default: 'svgfallback.css'
* backgroundUrl — url of background image, default: options.pngFileName
* prefix — prefix for classNames, default: ''
* cssTemplate — path to custom CSS lodash template, default: 'template.css'
* spriteWidth — maximum width of the sprite, default: 400

## Usage

The following task will output png file and css file:

```js
var svgfallback = require('gulp-svgfallback');
var gulp = require('gulp');

gulp.task('svgfallback', function () {
    return gulp
        .src('src/*.svg')
        .pipe(svgfallback({
            pngFileName: 'sprite.png',
            cssFileName: 'sprite.css',
            prefix: 'icon-'
        }))
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
    "prefix": "icon-",
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
    return gulp.src('src/*.svg')
        .pipe(gulpif(isCircle, colorize('red')))
        .pipe(gulpif(isCircle, colorize('blue')))
        .pipe(svgfallback())
        .pipe(gulp.dest('dest'));
});
```

## Changelog

* 1.0.1 Added example of how to add variations
* 1.0.0 Initial release
