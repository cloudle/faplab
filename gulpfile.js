var gulp = require('gulp'),
  helpers = require('./gulp/helpers'),
  vendors = require('./gulp/vendor'),
  merge = require('utils-merge'),
  concat = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  nodemon = require('gulp-nodemon'),
  browserify = require('browserify'),
  browserifyInc = require('browserify-incremental'),
  babel = require('gulp-babel'),
  babelify = require('babelify'),
  tsify = require('tsify'),
  watchify = require('watchify'),
  nodeResolve = require('resolve'),
  browserSync = require('browser-sync').create(),

  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  nib = require('nib'),
  jeet = require('jeet'),
  rupture = require('rupture');

gulp.task('bundle-scripts', function () {
  var entryPoint = './app/entry.ts', filename = 'bundle.js',
      browserifyInstance = browserifyInc(entryPoint, {
        cacheFile: './build/browserify-cache.json'
      });

  vendors.nodeModules.forEach(function (lib) {
    browserifyInstance.external(lib);
  });

  var bundler = watchify(browserifyInstance).plugin('tsify');

  helpers.bundleScript(bundler, filename, browserSync);
  bundler.on('update', function () {
    helpers.bundleScript(bundler, filename, browserSync);
  }).on('log', helpers.mapLog);
});

gulp.task('bundle-vendors', function() {
  var filename = 'vendor.js', browserifyInstance = browserify({});
  vendors.nodeModules.forEach(function (lib) {
    browserifyInstance.require(nodeResolve.sync(lib), {expose: lib})
  });
  helpers.bundleScript(browserifyInstance, filename, browserSync);
});

gulp.task('babelify', function(){
  watchifyBuilder(babelify, './app/entry.js', 'bundle.js', {presets: ["es2015", "stage-0"]}, true);
});

function watchifyBuilder(compressor, entryPoint, filename, options, uglifyDisable) {
  var args = merge(watchify.args, { debug: true, cacheFile: './build/browserify-cache.json' });
  var bundler = watchify(browserifyInc(entryPoint, args)).transform(compressor, options);
  helpers.bundleScript(bundler, filename, browserSync, uglifyDisable);
  bundler.on('update', function(){
    helpers.bundleScript(bundler, filename, browserSync, uglifyDisable);
  }).on('log', helpers.mapLog)
}

gulp.task("clone-templates", function () {
  gulp.src(['./app/**/*.html'])
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
});

gulp.task('bundle-styles', function() {
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

gulp.task('default', ['clone-templates', 'bundle-styles', 'bundle-scripts', 'browser-sync']);