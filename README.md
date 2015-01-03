gulp-svgfallback
================

Generate png sprite from svg icons

**Please note** that this is still in development and the code is a bit messy.

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

gulp.task('svg', function () {
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

### Custom templates

Two additional options `cssTemplate` and `spriteTemplate` allow you
to override templates that are used to generate output css, or html source of
the sprite respectively. For more info, please check the default templates
in 'templates/' directory of this project.
