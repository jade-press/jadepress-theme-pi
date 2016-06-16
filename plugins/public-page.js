

module.exports = function(ext) {


'use strict'

/**
 * catogory
 */

var 
local = ext.local
,setting = ext.setting
,tools = ext.tools
,log = ext.log
,err = ext.err
,db = ext.db
,path = require('path')
,baseThemeViewPath = ext.baseThemeViewPath
,Pager = ext.Pager
,pager = ext.pager
,getCats = ext.getCats
,getPosts = ext.getPosts
,buildThemeRes = tools.buildThemeRes

var extend = {}
var basicPostFields = {
	id: 1
	,desc: 1
	,cats: 1
	,title: 1
	,tags: 1
	,slug: 1
	,files: 1
	,featuredFile: 1
	,createBy: 1
	,createTime: 1
	,html: 1
}

extend.home = async (ctx, next) => {

	try {

		let query = ctx.query
		let page = query.page || 1
		page = parseInt(page, 10) || 1
		let pageSize = query.pageSize || setting.pageSize
		pageSize = parseInt(pageSize, 10) || setting.pageSize

		let user = ctx.session.user
		ctx.local.user = user

		let obj = yield getPosts({
			page: page
			,pageSize: pageSize
			,fields: basicPostFields
		})

		let pagerHtml = pager.render({
			page: page
			,pageSize: pageSize
			,total: obj.total
			,url: ctx.path
		})

		var objc = yield getCats()

		Object.assign(ctx.local, {
			pager: pagerHtml
			,pageSize: pageSize
			,total: obj.total
			,posts: obj.posts
			,themeRes: buildThemeRes(ctx.local.host)
			,publicRoute: setting.publicRoute
			,createUrl: tools.createUrl
			,cats: objc.cats
		})

		ctx.render(baseThemeViewPath + 'home', ctx.local)

	} catch(e) {

		err('failed render home page', e)
		ctx.status = 500
		ctx.local.error = e
		ctx.render(setting.path500, ctx.local)

	}

}

extend.post = async (ctx, next) => {

	try {

		let params = ctx.params
		let sea = tools.createQueryObj(params, [':_id', ':id', ':slug'])
		if(!sea) return yield next

		let user = ctx.session.user
		ctx.local.user = user

		sea.fields = Object.assign({}, basicPostFields, {
			css: 1
			,script: 1
		})

		let post = yield getPosts(sea)

		if(!post) return yield next

		var obj = yield getCats()

		Object.assign(ctx.local, {
			post: post
			,publicRoute: setting.publicRoute
			,createUrl:tools.createUrl
			,themeRes: buildThemeRes(ctx.local.host)
			,cats: obj.cats
		})
		
		ctx.render(baseThemeViewPath + '/post', ctx.local)

	} catch(e) {

		err('failed render single post page', e)
		ctx.status = 500
		ctx.local.error = e
		ctx.render(setting.path500, ctx.local)

	}

}

extend.cat = async (ctx, next) => {

	try {

		let params = ctx.params
		let query = ctx.query
		let sea = tools.createQueryObj(params, [':_id', ':id', ':slug'])
		if(!sea) return yield next

		let catObj = yield getCats(sea)
		if(!catObj) return yield next

		let page = query.page || 1
		page = parseInt(page, 10) || 1
		let pageSize = query.pageSize || setting.pageSize
		pageSize = parseInt(pageSize, 10) || setting.pageSize

		let user = ctx.session.user
		ctx.local.user = user

		let obj = yield getPosts({
			page: page
			,pageSize: pageSize
			,catId: catObj._id
			,fields: basicPostFields
		})

		var objc = yield getCats()

		let pagerHtml = pager.render({
			page: page
			,pageSize: pageSize
			,total: obj.total
			,url: ctx.path
		})

		Object.assign(ctx.local, {
			posts: obj.posts
			,page: page
			,pageSize: pageSize
			,total: obj.total
			,cat: catObj
			,pager: pagerHtml
			,themeRes: buildThemeRes(ctx.local.host)
			,publicRoute: setting.publicRoute
			,createUrl: tools.createUrl
			,cats: objc.cats
		})

		ctx.render(baseThemeViewPath + 'category', ctx.local)

	} catch(e) {

		err('failed render cat page', e)
		ctx.status = 500
		ctx.local.error = e
		ctx.render(setting.path500, ctx.local)

	}

}

extend.search = async (ctx, next) => {

	try {

		let query = ctx.query

		let page = query.page || 1
		page = parseInt(page, 10) || 1
		let pageSize = query.pageSize || setting.pageSize
		pageSize = parseInt(pageSize, 10) || setting.pageSize

		let user = ctx.session.user
		ctx.local.user = user

		let obj = yield getPosts({
			page: page
			,pageSize: pageSize
			,title: query.title
			,fields: basicPostFields
		})

		var objc = yield getCats()

		let pagerHtml = pager.render({
			page: page
			,pageSize: pageSize
			,total: obj.total
			,url: ctx.path
		})

		Object.assign(ctx.local, {
			posts: obj.posts
			,page: page
			,pageSize: pageSize
			,total: obj.total
			,pager: pagerHtml
			,themeRes: buildThemeRes(ctx.local.host)
			,publicRoute: setting.publicRoute
			,createUrl: tools.createUrl
			,cats: objc.cats
			,keyword: query.title
		})

		ctx.render(baseThemeViewPath + 'search', ctx.local)

	} catch(e) {

		err('failed render cat page', e)
		ctx.status = 500
		ctx.local.error = e
		ctx.render(setting.path500, ctx.local)

	}

}


return extend

////end
}
