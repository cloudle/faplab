var gulp = require('gulp'),
  gutil = require('gulp-util'),
  chalk = require('chalk'),
  order = require('gulp-order'),
  rename = require('gulp-rename'),
  merge = require('utils-merge'),
  gulpIf = require('gulp-if'),
  concat = require('gulp-concat'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  nodemon = require('gulp-nodemon'),
  browserify = require('browserify'),
  browserifyInc = require('browserify-incremental'),
  babel = require('gulp-babel'),
  babelify = require('babelify'),
  tsify = require('tsify'),
  watchify = require('watchify'),
  uglify = require('gulp-uglify'),
  buffer = require('vinyl-buffer'),
  browserSync = require('browser-sync').create(),

  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  nib = require('nib'),
  jeet = require('jeet'),
  rupture = require('rupture');

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

gulp.task('babelify', function(){
  watchifyBuilder(babelify, './app/entry.js', 'bundle.js', {presets: ["es2015", "stage-0"]}, true);
});

gulp.task('tsify', function () {
  var entryPoint = './app/entry.ts', filename = 'bundle.js',
      bundler = watchify(browserifyInc(entryPoint, {
        cacheFile: './build/browserify-cache.json'
      })).plugin('tsify');

  bundleScript(bundler, filename);
  bundler.on('update', function () {
    bundleScript(bundler, filename);
  }).on('log', mapLog);
});

function watchifyBuilder(compressor, entryPoint, filename, options, uglifyDisable) {
  var args = merge(watchify.args, { debug: true, cacheFile: './build/browserify-cache.json' });
  var bundler = watchify(browserify(entryPoint, args)).transform(compressor, options);
  bundleScript(bundler, filename, uglifyDisable);
  bundler.on('update', function(){
    bundleScript(bundler, filename, uglifyDisable);
  }).on('log', mapLog)
}

function bundleScript(bundler, filename, uglifyDisable) {
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

gulp.task("clone-templates", function () {
  gulp.src(['./app/**/*.html']).pipe(gulp.dest('./build')).pipe(browserSync.stream());
});

gulp.task('style-bundle', function() {
  gulp.src(['./app/styles/entry.styl'])
    .pipe(sourcemaps.init())
    .pipe(stylus(stylus({use: [nib(), jeet(), rupture()]})))
    .pipe(autoprefixer({}))
    .pipe(concat("bundle.css"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
});

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    port: 2015,
    proxy: "http://localhost:7000",
    //files: ['./build/**/*'],
    open: false
  });

  gulp.watch("./app/**/*.styl", ['style-bundle']);
  gulp.watch("./app/**/*.html", ['clone-templates']);
});

var nodemonIgnores = ['app/**/*', 'build/**/*'];
gulp.task('nodemon', function (callback) {
  var started = false;
  nodemon({script: 'server.js', ignore: nodemonIgnores}).on('start', function () {
    if (!started) { callback(); started = true; }
  });
});

gulp.task('default', ['clone-templates', 'style-bundle', 'tsify', 'browser-sync']);