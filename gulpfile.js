// -------------------------------------------------------------------------
// GET THINGS SET UP
// -------------------------------------------------------------------------

// Include Gulp
var gulp = require('gulp');

// CSS plugins
const sass = require('gulp-sass'); //sass
const autoprefixer = require('gulp-autoprefixer'); 
const cleanCss = require('gulp-clean-css');

// JS plugins
const uglify = require('gulp-uglify'); // js minification
const concat = require('gulp-concat'); // imports files into one

// Image plugins
const imagemin = require('gulp-imagemin'); //image minification


// General plugins
const browserSync = require('browser-sync').create(); //auto broswer reload
const sourcemaps = require('gulp-sourcemaps')//
const merge = require('merge-stream'); //
const del = require('del');
var fileinclude = require('gulp-file-include');
const { series } = require('gulp');

// -------------------------------------------------------------------------
// PATHS for the Folder Structure
// -------------------------------------------------------------------------

//Defining all paths
const paths = {
    src: {
        base: './src/',
        scss: './src/scss/',
        images: './src/assets/images/**',
        indexHtml: './src/*.html',
        pagesHtml: './src/pages/**/*.html',
        includes: './src/includes/**/*.html' ,
        js: './src/js/**/*.js',
        vendor: './src/vendor/',
        node_modules: './node_modules/',
    },
    dist: {
        base: './dist/',
        indexHtml: './dist/*.html',
        pagesHtml: './dist/pages/',
        assets: './dist/assets/',
        css: './dist/assets/css/',
        images: './dist/assets/images/',
        js: './dist/assets/js/',
        vendor: './dist/vendor/'
    }

}


// cleaning up folder structure 
// removing vendors and using assets 
// assets, pages, and index.html
// assets => css, js, images, others
// eg css => bootstrap folder => bootstrap.min.css etc 

// -------------------------------------------------------------------------
// TASKS
// -------------------------------------------------------------------------




// clean up dist file and folders

function clean() {
    return del([paths.dist.base + '**/*']);
};



// Bring third party dependencies from node_modules into vendor directory
function modules() {
    // Font Awesome CSS
    var fontAwesomeCSS = gulp.src(paths.src.node_modules + '@fortawesome/fontawesome-free/css/all.min.css')
    .pipe(gulp.dest(paths.dist.vendor + '@fortawesome/fontawesome-free/css/'));
    // Font Awesome Webfonts
    var fontAwesomeWebfonts = gulp.src(paths.src.node_modules + '@fortawesome/fontawesome-free/webfonts/*')
    .pipe(gulp.dest(paths.dist.vendor + '@fortawesome/fontawesome-free/webfonts/'));
    // BootstrapJs
    var bootstrapJs = gulp.src(paths.src.node_modules + 'bootstrap/dist/js/bootstrap.min.js')
        .pipe(gulp.dest(paths.dist.vendor + 'bootstrap/dist/js/'));
    // Popper
    var popper = gulp.src(paths.src.node_modules + '@popperjs/core/dist/umd/popper.min.js')
        .pipe(gulp.dest(paths.dist.vendor + '@popperjs/dist/umd/'));
    return merge(fontAwesomeCSS, fontAwesomeWebfonts, bootstrapJs, popper);
}



//Compile scss into css task
function scss() {
    //Location of main and other scss files
    return gulp.src([paths.src + "**/*.scss", paths.src.scss + "style.scss"])
        .pipe(sourcemaps.init({ loadMaps: true }))
        //Pass scss file to sass compiler and show sass error
        .pipe(sass().on('error', sass.logError))
        //Autoprefix the css
        .pipe(autoprefixer('last 2 versions'))
        .pipe(sourcemaps.write('.'))
        //Location of compiled css
        .pipe(gulp.dest([paths.dist.css]))
        //Making sure it sync on any changes
        .pipe(browserSync.reload({stream: true}));
};



//Concat and minify css task
function cssConcat () {
    // location of css file
    return gulp.src([paths.dist.css + 'style.css'])
        .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
        .pipe(concat('style.min.css'))
        .pipe(cleanCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest([paths.dist.css]))
};


//Copy all index html file
function html  () {
    return gulp.src([paths.src.indexHtml])
        .pipe(fileinclude({
            prefix: '@@',
            basepath:'./src/includes/',
        }))
        .pipe(gulp.dest([paths.dist.base]))
        // .pipe(browserSync.reload({ stream: true }))
};

//Copy and minify custom JS files
function copyJs () {
    return gulp.src([paths.src.js])
    .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest([paths.dist.js]))
};


//Copy and minify images - jpg,png,svg files
function imageMin () {
    return gulp.src([paths.src.images])
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(gulp.dest([paths.dist.images]))
};



//BrowserSync as server
function server(done) {
    browserSync.init({
        server: {
            baseDir: paths.dist.base
        },
      
    });
    done();
    
}

// server reload
function browserSyncReload(done) {
    browserSync.reload();
    done();
};


// Watch files
function watchFiles() {
    gulp.watch('./src/scss/**/*', scss);
    gulp.watch('./src/**/*.html', gulp.series(html, copyJs, imageMin, browserSyncReload));
}


//Default Gulp task - run gulp 
exports.default = series(
    clean,
    modules,
    scss,
    cssConcat,
    html,
    copyJs,
    imageMin,
    server,
    watchFiles
);