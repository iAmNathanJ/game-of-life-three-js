'use strict';

let gulp = require('gulp'),
    babel = require('gulp-babel'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer');


// S E T U P ========================

const reload = () => {
  gulp.src('index.html')
    .pipe(connect.reload());
};


// T A S K S ========================

gulp.task('css', () => {
  gulp.src('./scss/main.scss')
    .pipe(sass()
      .on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./css'));
  reload();
});

gulp.task('js', function() {
  return gulp.src('./js/src/main.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./js'));
});

gulp.task('build', ['css', 'js']);

gulp.task('serve', ['build'], () => {
  connect.server({
    root: './',
    port: 3000,
    livereload: true
  });
});

gulp.task('default', ['serve'], () => {
  gulp.watch('./scss/**/*', ['css']);
  gulp.watch('./js/src/**/*', ['js']);
});
