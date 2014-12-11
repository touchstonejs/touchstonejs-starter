var del = require('del'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	less = require('gulp-less'),
	plumber = require('gulp-plumber'),
	shell = require('gulp-shell'),
	browserify = require('browserify'),
	brfs = require('brfs'),
	watchify = require('watchify'),
	reactify = require('reactify'),
	source = require('vinyl-source-stream'),
	merge = require('merge-stream'),
	chalk = require('chalk');

/**
* Clean
*/

gulp.task('clean', function() {
	del(['./www/*']);
});


/**
* Preview Server
*/

gulp.task('serve', function() {
	var express = require('express');
	var app = express();
	
	app.use(express.static('./www'));
	
	var server = app.listen(process.env.PORT || 8000, function() {
		console.log('Local Server ready on port %d', server.address().port);
	});
});


/**
* Build
*/

gulp.task('less', function() {
	return gulp.src('src/css/app.less')
	.pipe(less())
	.pipe(gulp.dest('www/css'));
});

gulp.task('html', function() {
	return gulp.src('src/index.html')
	.pipe(gulp.dest('www'));
});

gulp.task('images', function() {
	return gulp.src('src/img/**')
	.pipe(gulp.dest('www/img'));
});

gulp.task('fonts', function() {
	return gulp.src('src/fonts/**')
	.pipe(gulp.dest('www/fonts'));
});

function doBundle(target, name, dest) {
	return target.bundle()
	.on('error', function(e) {
		gutil.log('Browserify Error', e);
	})
	.pipe(source(name))
	.pipe(gulp.dest(dest));
}

function watchBundle(target, name, dest) {
	return watchify(target)
	.on('update', function (scriptIds) {
		scriptIds = scriptIds
		.filter(function(i) { return i.substr(0,2) !== './' })
		.map(function(i) { return chalk.blue(i.replace(__dirname, '')) });
		if (scriptIds.length > 1) {
			gutil.log(scriptIds.length + ' Scripts updated:\n* ' + scriptIds.join('\n* ') + '\nrebuilding...');
		} else {
			gutil.log(scriptIds[0] + ' updated, rebuilding...');
		}
		doBundle(target, name, dest);
	})
	.on('time', function (time) {
		gutil.log(chalk.green(name + ' built in ' + (Math.round(time / 10) / 100) + 's'));
	});
}

function buildApp(watch) {
	
	var opts = watch ? watchify.args : {};
	
	opts.debug = watch ? true : false;
	opts.hasExports = true;
	
	var src = './src/js',
	dest = './www/js',
	name = 'app.js';
	
	var bundle = browserify(opts)
		.add([src, name].join('/'))
		.transform(reactify)
		.transform(brfs);
	
	if (watch) {
		watchBundle(bundle, name, dest);
	}
	
	return doBundle(bundle, name, dest);
	
}

gulp.task('scripts', function() {
	return buildApp();
});

gulp.task('watch-scripts', function() {
	return buildApp(true);
});

gulp.task('build', ['html', 'images', 'fonts', 'less', 'scripts']);

gulp.task('watch', ['html', 'images', 'fonts', 'less', 'watch-scripts'], function() {
	gulp.watch(['src/index.html'], ['html']);
	gulp.watch(['src/css/**/*.less'], ['less']);
	gulp.watch(['src/img/**/*.*'], ['images']);
	gulp.watch(['src/fonts/**/*.*'], ['fonts']);
});

gulp.task('dev', ['watch', 'serve']);

/**
* Cordova
*/

gulp.task('prepare', ['html', 'images', 'fonts', 'less', 'scripts'], function() {
	return gulp.src('')
	.pipe(plumber())
	.pipe(shell(['cordova prepare'], { cwd: __dirname }));
});

gulp.task('android', ['prepare'], function() {
	return gulp.src('')
	.pipe(plumber())
	.pipe(shell(['cordova run android'], { cwd: __dirname }));
});
