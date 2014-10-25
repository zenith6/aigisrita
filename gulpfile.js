var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();
var shelljs = require('shelljs');
var merge   = require('merge-stream');
var pkg     = require('./package.json');
var argv    = require('yargs').argv;

gulp.task('scripts', function () {
  var jquery = gulp.src([
      'bower_components/jquery/dist/jquery.min.js'
    ])
    .pipe(gulp.dest('src/vendor/jquery'));

  var gsap = gulp.src([
      'bower_components/gsap/src/minified/**/*.js'
    ])
    .pipe(gulp.dest('src/vendor/gsap'));

  return merge(jquery, gsap);
});

gulp.task('package', ['validate-metadata'], function () {
  var file = pkg.name + '-' + getVersion() +'.zip';

  return gulp.src('src/**/*')
    .pipe(plugins.zip(file))
    .pipe(gulp.dest('dist'));
});

gulp.task('validate-metadata', function () {
  var files = [
    './bower.json',
    './src/manifest.json'
  ];

  files.forEach(function (file) {
    var metadata = require(file);
    if (metadata.version != pkg.version) {
      var msg = 'Inconsistency version found. at: ' + file +
        ' expected:' + pkg.version +
        ' actual:' + metadata.version;
      throw new Error(msg);
    }
  });
});

gulp.task('bump', function () {
  var options = {
    type: argv.type,
    version: argv.version
  };

  var root = gulp.src(['./package.json', './bower.json'])
    .pipe(plugins.bump(options))
    .pipe(gulp.dest('./'));

  var src = gulp.src('./src/manifest.json')
    .pipe(plugins.bump(options))
    .pipe(gulp.dest('./src/'));

  return merge(root, src);
});

function getVersion() {
  var result = shelljs.exec('git rev-list HEAD --count', {silent: true});
  var rev = result.output.replace(/\n/, '');
  return pkg.version + '.' + rev;
}

gulp.task('default', ['scripts', 'package']);
