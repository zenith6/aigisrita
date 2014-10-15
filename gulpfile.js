'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('build', function () {
  return gulp.src([
      'bower_components/jquery/dist/jquery.js'
    ])
    .pipe(gulp.dest('src/vendor'));
});

gulp.task('default', ['build']);
