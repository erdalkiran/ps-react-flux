'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect'); //runs a local dev server
var open = require('gulp-open'); //open a URL in a web browser
var browserify = require('browserify');// bundles JS
var reactify = require('reactify');//transforms react JSX to JS
var vinyl = require('vinyl-source-stream');// user conventional text streams with Gulp
var concat = require('gulp-concat');//concatenates files
var lint = require('gulp-eslint');// lint JS files including JSX


var config = {
    port: 9000,
    devBaseUrl: 'http://localhost',
    absoluteUrl: function () {
        return this.devBaseUrl + ':' + this.port + '/';
    },
    paths: {
        html: './src/**/*.html',
        css: [
            './node_modules/bootstrap/dist/css/bootstrap.min.css',
            './node_modules/bootstrap/dist/css/bootstrap-thme.min.css',
            './node_modules/toastr/toastr.css'
        ],
        images: [
            './src/images/*'
        ],
        favicon: './src/favicon.ico',
        js: [
            './src/**/*.js',
            './src/**/*.jsx'
        ],
        mainJs: './src/main.jsx',
        dist: './dist'
    }
};

//Start a local dev server
gulp.task('connect', function () {
    connect.server({
        root: ['dist'],
        port: config.port,
        base: config.devBaseUrl,
        livereload: true
    });
});

gulp.task('open', ['connect'], function () {
    gulp.src('dist/index.html')
        .pipe(open({uri: config.absoluteUrl()}));
});

gulp.task('html', function () {
    gulp.src(config.paths.html)
        .pipe(gulp.dest(config.paths.dist))
        .pipe(connect.reload());
});

gulp.task('js', function () {
    browserify(config.paths.mainJs)
        .transform(reactify)
        .bundle()
        .on('error', console.error.bind(console))
        .pipe(vinyl('bundle.js'))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe(connect.reload());
});

gulp.task('css', function () {
    gulp.src(config.paths.css)
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(config.paths.dist + '/css'));
});

gulp.task('images', function () {
    gulp.src(config.paths.images)
        .pipe(gulp.dest(config.paths.dist + '/images'));

    gulp.src(config.paths.favicon)
        .pipe(gulp.dest(config.paths.dist));
});

gulp.task('lint', function () {
    return gulp.src(config.paths.js)
        .pipe(lint({config: 'eslint.config.json'}))
        .pipe(lint.format());
});

gulp.task('watch', function () {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.js, ['js', 'lint']);
});

gulp.task('default', ['html', 'js', 'lint', 'css', 'images', 'open', 'watch']);