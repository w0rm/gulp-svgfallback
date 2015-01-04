gulp-svgfallback [![Build Status](https://api.travis-ci.org/w0rm/gulp-svgfallback.png)](https://travis-ci.org/w0rm/gulp-svgfallback)
================

Generate png sprite from svg icons

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
