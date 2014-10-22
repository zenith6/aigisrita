var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();
var shelljs = require('shelljs');
var info    = require('./package.json');

gulp.task('scripts', function () {
  return gulp.src([
      'bower_components/jquery/dist/jquery.js'
    ])
    .pipe(gulp.dest('src/vendor'));
});

gulp.task('package', function () {
  var file = info.name + '-' + getVersion() +'.zip';

  return gulp.src('src/**/*')
    .pipe(plugins.zip(file))
    .pipe(gulp.dest('dist'));
});

function getVersion() {
  var result = shelljs.exec('git rev-list HEAD --count', {silent: true});
  var build = result.output.replace(/\n/, '');
  return info.version + '.' + build;
}

gulp.task('default', ['scripts', 'package']);
