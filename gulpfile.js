'use strict';

let gulp = require('gulp'),
  gp = require('gulp-load-plugins')(),
  fs = require('fs'),
  del = require('del'),
  browserSync = require('browser-sync').create();


// clean
gulp.task('clean', function() {
  return del(['build/**', '!build']);
});

// pug
gulp.task('pug', () => {

  return gulp.src('src/template/pages/*.pug')
    .pipe(gp.pug({
      locals: JSON.parse(fs.readFileSync('./content.json', 'utf-8')),
      pretty: true
    }))
    .pipe(gulp.dest('build'))
    .on('end', browserSync.reload);
});

// sass
gulp.task('sass', () => {
  return gulp.src('src/styles/*.sass')
    .pipe(gp.sourcemaps.init())
    .pipe(gp.sass({ 'include css': true }))
    .on("error", gp.notify.onError({
      message: 'Error: <%= error.message %>',
      title: 'Style error'
    }))
    .pipe(gp.autoprefixer({ overrideBrowserslist: 'last 8 version' }))
    .pipe(gp.sourcemaps.write())
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({ stream: true }));
});

// js
gulp.task('js', () => {
  return gulp.src('src/js/**/*.js')
    .pipe(gp.sourcemaps.init())
    .pipe(gp.concat('app.js'))
    .pipe(gp.sourcemaps.write())
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.reload({ stream: true }));
});

// js:foundation
gulp.task('js:foundation', () => {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js'
    // and others libs
  ])
    .pipe(gp.concat('foundation.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.reload({ stream: true }));
});

// css:foundation
gulp.task('css:foundation', () => {
  return gulp.src([
    'node_modules/normalize.css/normalize.css'
    // css libs on npm
  ]) 
    .pipe(gp.concatCss('foundation.css'))
    .pipe(gp.csso())
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({ stream: true }));
});

// copy:image
gulp.task('copy:image', () => {
  return gulp.src('src/img/**/*.*')
    .pipe( gulp.dest('build/img'));
});

// copy:fonts
gulp.task('copy:fonts', () => {
  return gulp.src('src/fonts/**/*.*')
    .pipe( gulp.dest('build/fonts'));
});

// watch
gulp.task('watch', () => {
  gulp.watch('src/template/**/*.pug', gulp.series('pug'));
  gulp.watch('src/styles/**/*.sass', gulp.series('sass'));
  gulp.watch('src/js/**/*.js', gulp.series('js'));
  gulp.watch('src/img/**/*.*', gulp.series('copy:image'));
  gulp.watch('src/fonts/**/*.*', gulp.series('copy:fonts'));
});

// server
gulp.task('server', function() {
  browserSync.init({
      open: false,
      server: {
        baseDir: "./build"
      }
  });
});

// default
gulp.task('default', gulp.series(
  'clean',
  gulp.parallel(
    'pug',
    'sass',
    'js',
    'css:foundation',
    'js:foundation',
    'copy:image',
    'copy:fonts'
  ),
  gulp.parallel(
    'watch',
    'server'
  )
));