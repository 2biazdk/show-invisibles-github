'use strict';

var gulp   = require('gulp');
var plugin = require('gulp-load-plugins')({
	pattern: [
		'gulp-*',
		'gulp.*',
		'del',
		'run-sequence'
	]
});

gulp.task(
	'build',
	function() {
		plugin.runSequence(
			'clean',
			'todo',
			'js',
			'img',
			'misc',
			'packages'
		)
	}
);

gulp.task('clean', clean);
gulp.task('todo', todos);
gulp.task('js', js);
gulp.task('img', img);
gulp.task('misc', misc);
gulp.task('packages', packages);

gulp.task('jslint', jsLint);

function clean() {
	return plugin.del('dist/**');
}

function todos() {

	return gulp.src('./src/**/*.{html,htm,js,css}')

		// Don't break on error
		.pipe( plugin.plumber() )

		// Sourcemap
		.pipe( plugin.todo() )

		// Save in Dist folder
		.pipe( gulp.dest('.') )

		// Show size
		.pipe( plugin.size({
			title: 'todo',
			showFiles: true,
			gzip: true
		}) )

	;

}

function js() {

	return gulp.src(['./src/**/*.js'])

		// Don't break on error
		.pipe( plugin.plumber() )

		// Clean
		.pipe( plugin.tabify() )

		// Save in Src folder
		.pipe( gulp.dest('./src') )

		// Minify
		.pipe( plugin.minify({
			ext:{
				min:'.js'
			},
			noSource: true,
			mangle: true
		}) )

		// Save in Dist folder
		.pipe( gulp.dest('./dist') )

		// Show size
		.pipe( plugin.size({
			title: 'js',
			showFiles: true,
			gzip: true
		}) )

	;

}

function jsLint() {

	return gulp.src([
			'./src/**/*.js',
			'!./src/**/vendor/*'
		])

		// Don't break on error
		.pipe( plugin.plumber() )

		// JS linter
		.pipe( plugin.jshint() )
		.pipe( plugin.jshint.reporter('default') )

		// Show size
		.pipe( plugin.size({
			title: 'jsLinting',
			showFiles: true,
			gzip: true
		}) )

	;

}

function img() {
	return gulp.src('./src/img/**/*.{jpg,jpeg,png,gif,svg,bmp,ico}')

		// Don't break on error
		.pipe( plugin.plumber() )

		// Save in Dist folder
		.pipe( gulp.dest('./dist/img') )

		// Show size
		.pipe( plugin.size({
			title: 'img',
			showFiles: true,
			gzip: true
		}) )
	;

}

function misc() {

	return gulp.src('./src/**/*.{xml,json,ico}')

		// Save in Dist folder
		.pipe( gulp.dest('./dist') )

		// Show size
		.pipe( plugin.size({
			title: 'other files',
			showFiles: true,
			gzip: true
		}) )

	;

}

function packages() {

	gulp.src('./gulpfile.js')

		// Don't break on error
		.pipe( plugin.plumber() )

		// Clean
		.pipe( plugin.tabify() )

		// Save in root folder
		.pipe( gulp.dest('.') )

	;

	return gulp.src('./package.json')

		// Don't break on error
		.pipe( plugin.plumber() )

		// Clean
		.pipe( plugin.tabify(2) )

		// Save in root folder
		.pipe( gulp.dest('.') )

	;

}