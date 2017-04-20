var gulp = require('gulp')
    , minifycss = require('gulp-minify-css')
    , uglify = require('gulp-uglify')
    , rename = require('gulp-rename')
    , del = require('del');

gulp.task('default', ['build']);

gulp.task('minifycss', function () {

    var srcFiles = [
        'css/reset.css',
        'css/style.css',
        'css/color-picker.css'
    ];

    return gulp.src(srcFiles, {"base": "css"})
        .pipe(rename({suffix: ".min"}))
        .pipe(minifycss({
            advanced: true,
            compatibility: 'ie9+',
            keepBreaks: false,
            keepSpecialComments: '*'
        }))
        .pipe(gulp.dest("build/css"));
});

gulp.task('minifyjs', function () {
    var srcFiles = [
        'js/color-picker.js'
    ];
    return gulp.src(srcFiles, { "base": "js" })
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest("build/js")); //输出文件
});

gulp.task('clean', function (callback) {
    return del(['build/*']);
});

gulp.task('build', [ 'minifycss', 'minifyjs'], function (callback) {
    callback();
});