'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var info = require('./package.json');

gulp.task('scripts', function () {
  return gulp.src([
      'bower_components/jquery/dist/jquery.js'
    ])
    .pipe(gulp.dest('src/vendor'));
});

gulp.task('package', function () {
  return gulp.src('src/**/*')
    .pipe(plugins.zip(info.name + '-' + info.version + '.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts', 'package']);
