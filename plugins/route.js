
'use strict'

let path = require('path')

module.exports = function(ext) {


let extend = {}
let tools = ext.tools

let m404 = 	function* (next) {
	this.status =  404
	this.local.themeRes = tools.buildThemeRes(this.local.host)
	this.render( path.resolve(__dirname, '../views/404'), this.local)
}

let middlewares = ext.middlewares
let len = middlewares.length

middlewares = middlewares.slice(0, len - 1)

middlewares.push(m404)

extend.middlewares = middlewares

return extend

////end
}
