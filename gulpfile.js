var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var header = require('gulp-header')
var ngAnnotate = require('gulp-ng-annotate')
var sourcemaps = require('gulp-sourcemaps')
var mainBowerFiles = require('main-bower-files')
var filter = require('gulp-filter')
var minifycss = require('gulp-minify-css')

var pkg = require('./package.json')
var banner = ['/*',
              '<%= pkg.name %> - <%= pkg.description %>',
              '@version v<%= pkg.version %>',
              '@link <%= pkg.homepage %>',
              '@license <%= pkg.license %>',
              '*/',
              ''].join('\n')


gulp.task('js', function(){
    gulp.src(['app/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(ngAnnotate())
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(header(banner, {pkg:pkg}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist'))
})

gulp.task('css', function(){
    gulp.src(['assets/css/*.css'])
        .pipe(concat('main.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('./dist'))
})

gulp.task('libjs', function(){
    var f = filter('**/*.js', {restore:true})
    gulp.src(mainBowerFiles())
        .pipe(f)
        .pipe(concat('lib.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
})

gulp.task('libcss', function(){
    var f = filter('**/*.css', {restore:true})
    gulp.src(mainBowerFiles())
        .pipe(f)
        .pipe(concat('lib.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('./dist'))
})

gulp.task('default', ['js'])

