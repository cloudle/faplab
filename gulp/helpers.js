var gulp = require('gulp'),
  gutil = require('gulp-util'),
  chalk = require('chalk'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  sourcemaps = require('gulp-sourcemaps'),
  gulpIf = require('gulp-if'),
  uglify = require('gulp-uglify');

function mapError(err) {
  if (err.fileName) {
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname, ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.message || err.description))
  } else {
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message, err.toString()))
  }
  this.emit('end');
}

function mapLog(msg) { gutil.log('Script updated: '+chalk.blue.bold(msg)); }

function bundleScript(bundler, filename, browserSync, uglifyDisable) {
  return bundler.bundle()
    .on('error', mapError)
    .pipe(source(filename))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulpIf(!uglifyDisable, uglify()))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream())
}

module.exports = {
  mapError: mapError,
  mapLog: mapLog,
  bundleScript: bundleScript
};