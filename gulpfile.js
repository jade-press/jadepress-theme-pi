
'use strict'

let
ugly = require('gulp-uglify')
,gulp = require('gulp')
,watch = require('gulp-watch')
,plumber = require('gulp-plumber')
,newer = require('gulp-newer')
,stylus = require('gulp-stylus')
,concat = require('gulp-concat')
,rename = require('gulp-rename')
,runSequence = require('run-sequence')
,_ = require('lodash')
,path = require('path')
,fs = require('fs')

let
cssFolder = __dirname + '/public/css'
,jsFolder = __dirname + '/public/js'

,stylusOptions = {
	compress: true
}
,uglyOptions = {

}

let config = {}
let configPath = path.resolve(__dirname, 'gulp-config.js')

try {

	let res = fs.accessSync(configPath)
	config = require(configPath)
	console.log('gulp config loaded')
	
} catch(e) {
	console.log(e.stack)
	console.log('no gulp config')

}

gulp.task('stylus', function() {

	gulp.src(cssFolder + '/*.styl')
		
		.pipe(newer({
			dest: cssFolder
			,map: function(path) {
				return path.replace(/\.styl$/, '.css')
			}
		}))
		.pipe(plumber())
		.pipe(stylus(stylusOptions))
		.pipe(gulp.dest(cssFolder))

})


gulp.task('ugly', function() {

	gulp.src(jsFolder + '/*.js')
		.pipe(newer({
			dest: jsFolder
			,map: function(path) {
				return path.replace(/\.dev.js$/, '.min.js')
			}
		}))
		.pipe(plumber())
		.pipe(rename(function (path) {
			path.basename = path.basename.replace('.dev', '.min')
		}))
		.pipe(gulp.dest(jsFolder))
		.pipe(ugly(uglyOptions))
		.pipe(gulp.dest(jsFolder))

})

var exec = require('child_process').exec
 
if(config.syncTo) {
	gulp.task('cp', function (cb) {
		var exe = 'rsync -ar --exclude="node_modules/" ' + __dirname + ' ' + config.syncTo + '/node_modules'
		console.log(exe)
		exec(exe, function (err, stdout, stderr) {
			console.log(stdout)
			console.log(stderr)
			cb(err)
		})
	})
}

gulp.task('watch',  function () {

	watch(cssFolder, function() {
		runSequence('stylus')
	})

	watch(jsFolder, function() {
		runSequence('ugly')
	})

	watch([ __dirname + '/**/*.*', __dirname + '/*.*' ], function() {
		console.log('cp ')
		runSequence('cp')
	})

})




gulp.task('default', ['watch'])
gulp.task('dist', function() {
	runSequence('stylus', 'ugly')
})